import { useEffect, useRef, useState, useCallback, type FormEvent } from 'react';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { MP_PUBLIC_KEY } from '@/lib/mercadopago/config';
import { Button } from '@/components/common/Button';

interface CardFormProps {
  amount: number;
  onTokenReady: (data: {
    token: string;
    paymentMethodId: string;
    email: string;
    identificationType: string;
    identificationNumber: string;
  }) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  /** Compact mode hides email/document fields (for change-card flows) */
  compact?: boolean;
  submitLabel?: string;
}

interface IdentificationType {
  id: string;
  name: string;
  min_length: number;
  max_length: number;
}

const inputClass =
  'w-full h-10 border border-neutral-200 rounded-md px-3 text-sm text-neutral-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-shadow';

/**
 * MercadoPago card form using Secure Fields API (mp.fields).
 * Generates tokens WITH CVV validation, required for preapprovals/subscriptions.
 */
export const CardForm = ({
  amount,
  onTokenReady,
  onError,
  isProcessing,
  compact = false,
  submitLabel,
}: CardFormProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [idTypes, setIdTypes] = useState<IdentificationType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const mpRef = useRef<InstanceType<typeof window.MercadoPago> | null>(null);
  const fieldsRef = useRef<{
    cardNumber: ReturnType<InstanceType<typeof window.MercadoPago>['fields']['create']> | null;
    expirationDate: ReturnType<InstanceType<typeof window.MercadoPago>['fields']['create']> | null;
    securityCode: ReturnType<InstanceType<typeof window.MercadoPago>['fields']['create']> | null;
  }>({ cardNumber: null, expirationDate: null, securityCode: null });
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current || !MP_PUBLIC_KEY) return;
    mountedRef.current = true;

    let destroyed = false;

    async function init() {
      try {
        console.log('[MP] CardForm: Initializing MercadoPago SDK...');
        await loadMercadoPago();
        if (destroyed) return;

        const mp = new window.MercadoPago(MP_PUBLIC_KEY!, {
          locale: 'es-AR',
        });
        mpRef.current = mp;
        console.log('[MP] CardForm: SDK loaded, creating secure fields');

        const cardNumber = mp.fields.create('cardNumber', {
          placeholder: '1234 5678 9012 3456',
        });
        const expirationDate = mp.fields.create('expirationDate', {
          placeholder: 'MM/YY',
        });
        const securityCode = mp.fields.create('securityCode', {
          placeholder: '123',
        });

        fieldsRef.current = { cardNumber, expirationDate, securityCode };

        await cardNumber.mount('mp-card-number');
        await expirationDate.mount('mp-expiration-date');
        await securityCode.mount('mp-security-code');

        console.log('[MP] CardForm: Secure fields mounted');

        const types = await mp.getIdentificationTypes();
        if (!destroyed && Array.isArray(types)) {
          setIdTypes(types);
          console.log('[MP] CardForm: Identification types loaded:', types.length);
        }

        if (!destroyed) {
          setIsLoading(false);
          setIsMounted(true);
        }
      } catch (err) {
        if (destroyed) return;
        console.error('[MP] CardForm: Init error:', err);
        onError('Error al inicializar MercadoPago.');
        setIsLoading(false);
      }
    }

    init();

    return () => {
      destroyed = true;
      try {
        fieldsRef.current.cardNumber?.unmount();
        fieldsRef.current.expirationDate?.unmount();
        fieldsRef.current.securityCode?.unmount();
      } catch {
        // Ignore unmount errors during cleanup
      }
      fieldsRef.current = { cardNumber: null, expirationDate: null, securityCode: null };
      mpRef.current = null;
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!mpRef.current || submitting) return;

      const form = e.currentTarget;
      const cardholderName = (form.elements.namedItem('cardholderName') as HTMLInputElement)?.value;
      const cardholderEmail = (form.elements.namedItem('cardholderEmail') as HTMLInputElement)?.value || '';
      const identificationType = (form.elements.namedItem('identificationType') as HTMLSelectElement)?.value || '';
      const identificationNumber = (form.elements.namedItem('identificationNumber') as HTMLInputElement)?.value || '';

      if (!cardholderName) {
        onError('Ingresa el nombre del titular.');
        return;
      }
      if (!compact && (!cardholderEmail || !identificationType || !identificationNumber)) {
        onError('Complete todos los campos del formulario.');
        return;
      }

      setSubmitting(true);
      try {
        console.log('[MP] CardForm: Creating card token with Secure Fields...');
        const tokenData: Record<string, string> = { cardholderName };
        if (identificationType) tokenData.identificationType = identificationType;
        if (identificationNumber) tokenData.identificationNumber = identificationNumber;

        const tokenResponse = await mpRef.current.fields.createCardToken(tokenData);

        console.log('[MP] CardForm: Token response:', {
          hasId: !!tokenResponse?.id,
          status: tokenResponse?.status,
        });

        if (!tokenResponse?.id) {
          console.error('[MP] CardForm: No token in response');
          onError('No se pudo generar el token. Verifique los datos de la tarjeta.');
          return;
        }

        console.log('[MP] CardForm: Token generated successfully, calling onTokenReady');
        onTokenReady({
          token: tokenResponse.id,
          paymentMethodId: '',
          email: cardholderEmail,
          identificationType,
          identificationNumber,
        });
      } catch (err) {
        console.error('[MP] CardForm: createCardToken error:', err);
        const msg = err instanceof Error ? err.message : 'Error al procesar la tarjeta.';
        onError(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [onTokenReady, onError, submitting, compact],
  );

  const isButtonDisabled = !isMounted || isProcessing || submitting;
  const defaultLabel = compact ? 'Actualizar tarjeta' : 'Suscribirse con tarjeta';

  return (
    <div>
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-neutral-900 rounded-full animate-spin" />
          <span className="ml-2 text-sm text-neutral-500">Cargando formulario...</span>
        </div>
      )}

      <form
        id="mp-card-form"
        className={isLoading ? 'hidden' : 'space-y-3'}
        onSubmit={handleSubmit}
      >
        {/* Card number */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-1">Numero de tarjeta</label>
          <div
            id="mp-card-number"
            className="h-10 border border-neutral-200 rounded-md px-3 bg-white [&_iframe]:!h-full"
          />
        </div>

        {/* Expiration + CVV + Titular row */}
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-neutral-900 mb-1">Vencimiento</label>
            <div
              id="mp-expiration-date"
              className="h-10 border border-neutral-200 rounded-md px-3 bg-white [&_iframe]:!h-full"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-neutral-900 mb-1">CVV</label>
            <div
              id="mp-security-code"
              className="h-10 border border-neutral-200 rounded-md px-3 bg-white [&_iframe]:!h-full"
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="cardholderName" className="block text-sm font-medium text-neutral-900 mb-1">
              Titular
            </label>
            <input
              type="text"
              name="cardholderName"
              id="cardholderName"
              required
              className={inputClass}
              placeholder="Nombre Apellido"
            />
          </div>
        </div>

        {/* Additional fields (full mode) */}
        {!compact && (
          <>
            <div>
              <label htmlFor="cardholderEmail" className="block text-sm font-medium text-neutral-900 mb-1">
                Email
              </label>
              <input
                type="email"
                name="cardholderEmail"
                id="cardholderEmail"
                required
                className={inputClass}
                placeholder="email@ejemplo.com"
              />
            </div>

            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2">
                <label htmlFor="identificationType" className="block text-sm font-medium text-neutral-900 mb-1">
                  Tipo doc.
                </label>
                <select
                  name="identificationType"
                  id="identificationType"
                  required
                  className={inputClass}
                >
                  {idTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <label htmlFor="identificationNumber" className="block text-sm font-medium text-neutral-900 mb-1">
                  Numero de documento
                </label>
                <input
                  type="text"
                  name="identificationNumber"
                  id="identificationNumber"
                  required
                  className={inputClass}
                  placeholder="12345678"
                />
              </div>
            </div>
          </>
        )}

        {/* Submit */}
        <div className="pt-1">
          <Button
            type="submit"
            className="w-full"
            disabled={isButtonDisabled}
            loading={isProcessing || submitting}
          >
            {isProcessing || submitting ? 'Procesando...' : (submitLabel || defaultLabel)}
          </Button>
        </div>
      </form>
    </div>
  );
};
