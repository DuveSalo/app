import React, { useState, useRef } from 'react';
import createCardToken from '@mercadopago/sdk-react/esm/coreMethods/cardToken/create';
import { useMercadoPago } from '@/lib/mercadopago';
import type { Plan, CardPaymentData } from '@/types';
import { Loader2, AlertCircle, CreditCard, Calendar, Lock, User, FileText } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface PaymentFormProps {
  plan: Plan;
  payerEmail: string;
  onSuccess: (paymentData: CardPaymentData) => void;
  onError: (error: Error) => void;
}

interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  expiration: string; // Format: MM/YY
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
}

const IDENTIFICATION_TYPES = [
  { id: 'DNI', name: 'DNI' },
  { id: 'CI', name: 'CI' },
  { id: 'LC', name: 'LC' },
  { id: 'LE', name: 'LE' },
  { id: 'Otro', name: 'Otro' },
];

export const PaymentForm: React.FC<PaymentFormProps> = ({
  plan,
  payerEmail,
  onSuccess,
  onError,
}) => {
  const { isReady, error: sdkError } = useMercadoPago();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    cardholderName: '',
    expiration: '',
    securityCode: '',
    identificationType: 'DNI',
    identificationNumber: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CardFormData, string>>>({});

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl">
        {sdkError ? (
          <>
            <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
            <p className="text-sm text-red-600">{sdkError}</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
            <p className="text-sm text-gray-400">Cargando formulario de pago...</p>
          </>
        )}
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      // Format card number with spaces: 1234 5678 9012 3456
      const cleaned = value.replace(/\s/g, '').replace(/\D/g, '');
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      setFormData(prev => ({ ...prev, [name]: formatted.slice(0, 19) }));
    } else if (name === 'expiration') {
      // Format expiration: MM/YY
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      if (cleaned.length >= 2) {
        formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
      }
      setFormData(prev => ({ ...prev, [name]: formatted.slice(0, 5) }));
    } else if (name === 'securityCode') {
      const cleaned = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned.slice(0, 4) }));
    } else if (name === 'identificationNumber') {
      const cleaned = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name as keyof CardFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const parseExpiration = (expiration: string): { month: string; year: string } | null => {
    const parts = expiration.split('/');
    if (parts.length !== 2) return null;

    const month = parts[0].padStart(2, '0');
    let year = parts[1];

    // Convert YY to YYYY
    if (year.length === 2) {
      year = '20' + year;
    }

    return { month, year };
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CardFormData, string>> = {};

    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean || cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      newErrors.cardNumber = 'Numero de tarjeta invalido';
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Nombre del titular requerido';
    }

    // Validate expiration MM/YY
    const expParsed = parseExpiration(formData.expiration);
    if (!expParsed) {
      newErrors.expiration = 'Formato invalido (MM/AA)';
    } else {
      const month = parseInt(expParsed.month, 10);
      const year = parseInt(expParsed.year, 10);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (month < 1 || month > 12) {
        newErrors.expiration = 'Mes invalido';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiration = 'Tarjeta vencida';
      } else if (year > currentYear + 20) {
        newErrors.expiration = 'Año invalido';
      }
    }

    if (!formData.securityCode || formData.securityCode.length < 3) {
      newErrors.securityCode = 'CVV invalido';
    }

    if (!formData.identificationNumber || formData.identificationNumber.length < 6) {
      newErrors.identificationNumber = 'Documento invalido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const expParsed = parseExpiration(formData.expiration);
      if (!expParsed) {
        throw new Error('Fecha de vencimiento invalida');
      }

      // Generate card token using Mercado Pago SDK
      const cardTokenResult = await createCardToken({
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cardholderName: formData.cardholderName,
        cardExpirationMonth: expParsed.month,
        cardExpirationYear: expParsed.year,
        securityCode: formData.securityCode,
        identificationType: formData.identificationType,
        identificationNumber: formData.identificationNumber,
      });

      if (!cardTokenResult || !cardTokenResult.id) {
        throw new Error('No se pudo generar el token de la tarjeta');
      }

      console.log('[PaymentForm] Card token generated successfully');

      // Call onSuccess with the token data
      onSuccess({
        token: cardTokenResult.id,
        payment_method_id: cardTokenResult.first_six_digits ? getPaymentMethodId(cardTokenResult.first_six_digits) : 'card',
        issuer_id: '',
        installments: 1,
        payer: {
          email: payerEmail,
          identification: {
            type: formData.identificationType,
            number: formData.identificationNumber,
          },
        },
      });
    } catch (err) {
      console.error('[PaymentForm] Error generating card token:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la tarjeta';
      setFormError(errorMessage);
      onError(new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple function to detect card type from first digits
  const getPaymentMethodId = (firstSixDigits: string): string => {
    const first = firstSixDigits.charAt(0);
    if (first === '4') return 'visa';
    if (first === '5') return 'master';
    if (first === '3') return 'amex';
    return 'card';
  };

  const inputClassName = (fieldName: keyof CardFormData) => `
    w-full px-3 py-2.5 text-sm rounded-lg border transition-colors
    ${errors[fieldName]
      ? 'border-red-600 bg-red-50 focus:ring-red-600'
      : 'border-gray-200 bg-white focus:border-gray-900 focus:ring-gray-900'
    }
    focus:outline-none focus:ring-2 focus:ring-opacity-20
    text-gray-900 placeholder:text-gray-400
  `;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1.5">
          Numero de tarjeta
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            className={`${inputClassName('cardNumber')} pl-10`}
            disabled={isProcessing}
            autoComplete="cc-number"
          />
        </div>
        {errors.cardNumber && (
          <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
        )}
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1.5">
          Nombre del titular
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="cardholderName"
            value={formData.cardholderName}
            onChange={handleInputChange}
            placeholder="Como aparece en la tarjeta"
            className={`${inputClassName('cardholderName')} pl-10`}
            disabled={isProcessing}
            autoComplete="cc-name"
          />
        </div>
        {errors.cardholderName && (
          <p className="mt-1 text-xs text-red-600">{errors.cardholderName}</p>
        )}
      </div>

      {/* Expiration and CVV Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1.5">
            Vencimiento
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="expiration"
              value={formData.expiration}
              onChange={handleInputChange}
              placeholder="MM/AA"
              maxLength={5}
              className={`${inputClassName('expiration')} pl-10`}
              disabled={isProcessing}
              autoComplete="cc-exp"
            />
          </div>
          {errors.expiration && (
            <p className="mt-1 text-xs text-red-600">{errors.expiration}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1.5">
            CVV
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="securityCode"
              value={formData.securityCode}
              onChange={handleInputChange}
              placeholder="123"
              maxLength={4}
              className={`${inputClassName('securityCode')} pl-10`}
              disabled={isProcessing}
              autoComplete="cc-csc"
            />
          </div>
          {errors.securityCode && (
            <p className="mt-1 text-xs text-red-600">{errors.securityCode}</p>
          )}
        </div>
      </div>

      {/* Identification */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1.5">
            Tipo doc.
          </label>
          <select
            name="identificationType"
            value={formData.identificationType}
            onChange={handleInputChange}
            className={inputClassName('identificationType')}
            disabled={isProcessing}
          >
            {IDENTIFICATION_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-500 mb-1.5">
            Numero de documento
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="identificationNumber"
              value={formData.identificationNumber}
              onChange={handleInputChange}
              placeholder="12345678"
              className={`${inputClassName('identificationNumber')} pl-10`}
              disabled={isProcessing}
            />
          </div>
          {errors.identificationNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.identificationNumber}</p>
          )}
        </div>
      </div>

      {/* Form Error */}
      {formError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{formError}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Procesando...
          </span>
        ) : (
          `Pagar ${plan.price}${plan.priceSuffix}`
        )}
      </Button>

      {/* Security Note */}
      <p className="text-xs text-center text-gray-400">
        <Lock className="w-3 h-3 inline mr-1" />
        Pago seguro procesado por Mercado Pago
      </p>
    </form>
  );
};
