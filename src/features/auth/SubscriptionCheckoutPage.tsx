import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import { Button } from '@/components/common/Button';
import { CheckIcon } from '@/components/common/Icons';
import { ROUTE_PATHS } from '@/constants';
import { plansData } from './SubscriptionPage';
import { supabase } from '@/lib/supabase/client';
import { env } from '@/lib/env';
import { ArrowLeft, AlertCircle, Loader2, CreditCard, Shield, ExternalLink } from 'lucide-react';

type CheckoutStep = 'confirm' | 'processing' | 'error';

interface CreateSubscriptionResponse {
  success: boolean;
  init_point?: string;
  subscription_id?: string;
  status?: string;
  error?: string;
}

const SubscriptionCheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, currentCompany } = useAuth();

  // Get plan from URL query params
  const searchParams = new URLSearchParams(location.search);
  const planId = searchParams.get('plan') || 'standard';
  const plan = plansData.find((p) => p.id === planId) || plansData[1];

  const [step, setStep] = useState<CheckoutStep>('confirm');
  const [error, setError] = useState<string>('');

  // Redirect if no company or user
  useEffect(() => {
    if (!currentCompany || !currentUser) {
      navigate(ROUTE_PATHS.LOGIN);
    }
  }, [currentCompany, currentUser, navigate]);

  const handleSubscribe = async () => {
    setStep('processing');
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Sesion expirada. Por favor, inicie sesion nuevamente.');
      }

      const response = await fetch(
        `${env.VITE_SUPABASE_URL}/functions/v1/create-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            planId: plan.id,
            planName: plan.name,
            amount: plan.priceNumber,
            payerEmail: env.VITE_MP_TEST_USER_EMAIL || currentUser?.email,
          }),
        }
      );

      const result: CreateSubscriptionResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear la suscripcion');
      }

      // Redirect to MercadoPago checkout
      if (result.init_point) {
        window.location.href = result.init_point;
      } else {
        throw new Error('No se recibio la URL de pago');
      }

    } catch (err) {
      console.error('[Checkout] Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStep('error');
    }
  };

  const wizardSteps = ['Cuenta', 'Empresa', 'Suscripcion', 'Pago'];

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={4}>
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            Confirmar Suscripcion
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Seras redirigido a Mercado Pago para completar el pago
          </p>
        </div>

        {/* Confirm Step */}
        {step === 'confirm' && currentUser && (
          <div className="space-y-4">
            {/* Plan Summary Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Plan {plan.name}</h3>
                {plan.tag && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-900/10 text-gray-900 rounded-full">
                    {plan.tag}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-400">{plan.priceSuffix}</span>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Email de facturacion</span>
                  <span className="text-gray-900 font-medium">{currentUser.email}</span>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Pago seguro con Mercado Pago</p>
                <p className="text-blue-700 mt-1">
                  Seras redirigido a Mercado Pago donde podras pagar con tarjeta de credito,
                  debito o dinero en cuenta. Tus datos de pago estan protegidos.
                </p>
              </div>
            </div>

            {/* Subscribe Button */}
            <Button
              onClick={handleSubscribe}
              className="w-full"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Continuar al pago
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>

            {/* Back Link */}
            <button
              type="button"
              onClick={() => navigate(ROUTE_PATHS.SUBSCRIPTION)}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a seleccion de planes
            </button>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <Loader2 className="w-12 h-12 text-gray-900 animate-spin mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Preparando el pago...
            </h3>
            <p className="text-sm text-gray-500">
              En un momento seras redirigido a Mercado Pago
            </p>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error al procesar
            </h3>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => setStep('confirm')}>
                Intentar nuevamente
              </Button>
              <button
                type="button"
                onClick={() => navigate(ROUTE_PATHS.SUBSCRIPTION)}
                className="text-sm text-gray-400 hover:text-gray-500"
              >
                Cambiar plan
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default SubscriptionCheckoutPage;
