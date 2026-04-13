import { useEffect, useRef, useState, useCallback, type FormEvent } from 'react';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { MP_PUBLIC_KEY } from '@/lib/mercadopago/config';
import { Button } from '@/components/ui/button';

export interface CardTokenData {
  token: string;
  paymentMethodId: string;
  lastFourDigits: string | null;
  paymentTypeId: string | null;
  email: string;
  identificationType: string;
  identificationNumber: string;
}

interface CardFormProps {
  amount: number;
  onTokenReady: (data: CardTokenData) => void;
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
  'w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-colors';

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
  const [fieldErrors, setFieldErrors] = useState<{
    cardNumber?: string;
    expirationDate?: string;
    securityCode?: string;
  }>({});
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
        await loadMercadoPago();
        if (destroyed) return;

        const mp = new window.MercadoPago(MP_PUBLIC_KEY, {
          locale: 'es-AR',
        });
        mpRef.current = mp;

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

        // Surface real field-level errors (not SDK telemetry)
        for (const [name, field] of Object.entries(fieldsRef.current)) {
          const fieldName = name as 'cardNumber' | 'expirationDate' | 'securityCode';
          field?.on('error', () => {
            setFieldErrors((prev) => ({
              ...prev,
              [fieldName]: 'Error en el campo. Verificá los datos ingresados.',
            }));
          });
          field?.on('validityChange', (data: { errorMessages?: string[] }) => {
            if (data?.errorMessages && data.errorMessages.length > 0) {
              setFieldErrors((prev) => ({ ...prev, [fieldName]: data.errorMessages![0] }));
            } else {
              setFieldErrors((prev) => ({ ...prev, [fieldName]: undefined }));
            }
          });
        }

        const types = await mp.getIdentificationTypes();
        if (!destroyed && Array.isArray(types)) {
          setIdTypes(types);
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
      const cardholderEmail =
        (form.elements.namedItem('cardholderEmail') as HTMLInputElement)?.value || '';
      const identificationType =
        (form.elements.namedItem('identificationType') as HTMLSelectElement)?.value || '';
      const identificationNumber =
        (form.elements.namedItem('identificationNumber') as HTMLInputElement)?.value || '';

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
        const tokenData: Record<string, string> = { cardholderName };
        if (identificationType) tokenData.identificationType = identificationType;
        if (identificationNumber) tokenData.identificationNumber = identificationNumber;

        const tokenResponse = await mpRef.current.fields.createCardToken(tokenData);

        if (!tokenResponse?.id) {
          console.error('[MP] CardForm: No token in response');
          onError('No se pudo generar el token. Verifique los datos de la tarjeta.');
          return;
        }

        const tr = tokenResponse as Record<string, unknown>;
        onTokenReady({
          token: tokenResponse.id,
          paymentMethodId: (tr.payment_method_id as string) || '',
          lastFourDigits: (tr.last_four_digits as string) || null,
          paymentTypeId: (tr.payment_type_id as string) || null,
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
    [onTokenReady, onError, submitting, compact]
  );

  const isButtonDisabled = !isMounted || isProcessing || submitting;
  const defaultLabel = compact ? 'Actualizar tarjeta' : 'Suscribirse con tarjeta';

  return (
    <div>
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Cargando formulario...</span>
        </div>
      )}

      <form
        id="mp-card-form"
        className={isLoading ? 'hidden' : 'space-y-2.5'}
        onSubmit={handleSubmit}
      >
        {/* Card number */}
        <div>
          <label className="mb-0.5 block text-sm font-medium text-foreground">
            Número de tarjeta
          </label>
          <div
            id="mp-card-number"
            className="h-9 rounded-lg border border-input px-3 bg-transparent [&_iframe]:!h-full [&_iframe]:!w-full [&_iframe]:!border-none"
          />
          {fieldErrors.cardNumber && (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.cardNumber}</p>
          )}
        </div>

        {/* Expiration + CVV + Titular row */}
        <div className="grid grid-cols-5 gap-2.5">
          <div className="col-span-2">
            <label className="mb-0.5 block text-sm font-medium text-foreground">Vencimiento</label>
            <div
              id="mp-expiration-date"
              className="h-9 rounded-lg border border-input px-3 bg-transparent [&_iframe]:!h-full [&_iframe]:!w-full [&_iframe]:!border-none"
            />
            {fieldErrors.expirationDate && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.expirationDate}</p>
            )}
          </div>
          <div className="col-span-1">
            <label className="mb-0.5 block text-sm font-medium text-foreground">CVV</label>
            <div
              id="mp-security-code"
              className="h-9 rounded-lg border border-input px-3 bg-transparent [&_iframe]:!h-full [&_iframe]:!w-full [&_iframe]:!border-none"
            />
            {fieldErrors.securityCode && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.securityCode}</p>
            )}
          </div>
          <div className="col-span-2">
            <label
              htmlFor="cardholderName"
              className="mb-0.5 block text-sm font-medium text-foreground"
            >
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
              <label
                htmlFor="cardholderEmail"
                className="mb-0.5 block text-sm font-medium text-foreground"
              >
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

            <div className="grid grid-cols-5 gap-2.5">
              <div className="col-span-2">
                <label
                  htmlFor="identificationType"
                  className="mb-0.5 block text-sm font-medium text-foreground"
                >
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
                <label
                  htmlFor="identificationNumber"
                  className="mb-0.5 block text-sm font-medium text-foreground"
                >
                  Número de documento
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
        <div className="pt-0.5">
          <Button
            type="submit"
            className="w-full"
            disabled={isButtonDisabled}
            loading={isProcessing || submitting}
          >
            {isProcessing || submitting ? 'Procesando...' : submitLabel || defaultLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};
