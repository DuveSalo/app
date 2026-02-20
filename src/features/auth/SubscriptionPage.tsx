
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from './AuthContext';
import { CheckIcon } from '../../components/common/Icons';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS } from '../../constants/index';
import { Plan } from '../../types/index';
import { paypalScriptOptions } from '../../lib/paypal/config';
import { isMpEnabled } from '../../lib/mercadopago/config';
import { CardForm } from './components/CardForm';
import * as api from '../../lib/api/services';

export type PaymentMethod = 'paypal' | 'mercadopago';

export const plansData: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$25',
    priceNumber: 25,
    priceSuffix: '/mes',
    features: ['Gestion de 5 modulos', 'Dashboard de vencimientos', 'Soporte por email'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$49',
    priceNumber: 49,
    priceSuffix: '/mes',
    features: ['Gestion de 10 modulos', 'Alertas avanzadas', 'Soporte prioritario'],
    tag: 'Mas Popular',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$89',
    priceNumber: 89,
    priceSuffix: '/mes',
    features: ['Modulos ilimitados', 'Reportes personalizados', 'Soporte 24/7 por telefono'],
  },
];

// ARS prices for MercadoPago (displayed when MP is selected)
export const mpPlansData: Record<string, { priceArs: string; priceNumberArs: number }> = {
  basic: { priceArs: 'ARS 25.000', priceNumberArs: 25000 },
  standard: { priceArs: 'ARS 49.000', priceNumberArs: 49000 },
  premium: { priceArs: 'ARS 89.000', priceNumberArs: 89000 },
};

const SubscriptionPage: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plansData[1].id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(isMpEnabled ? 'mercadopago' : 'paypal');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isActivatingTrial, setIsActivatingTrial] = useState(false);
  const { currentCompany, currentUser, refreshCompany } = useAuth();
  const navigate = useNavigate();

  const canStartTrial = currentCompany && !currentCompany.trialEndsAt && !currentCompany.isSubscribed;

  const handleStartTrial = async () => {
    if (!currentCompany) return;
    setIsActivatingTrial(true);
    setError('');
    try {
      await api.activateTrial(currentCompany.id);
      await refreshCompany(true);
      navigate(ROUTE_PATHS.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al activar la prueba gratuita.');
    } finally {
      setIsActivatingTrial(false);
    }
  };

  const selectedPlanDetails = plansData.find((p) => p.id === selectedPlanId);
  const selectedMpPrice = mpPlansData[selectedPlanId];

  const wizardSteps = ['Cuenta', 'Empresa', 'Suscripcion'];

  const handleMpTokenReady = async (data: {
    token: string;
    paymentMethodId: string;
    email: string;
  }) => {
    if (!currentCompany) return;
    console.log('[MP] SubscriptionPage: Token received, creating subscription', {
      planKey: selectedPlanId,
      companyId: currentCompany.id,
      hasToken: !!data.token,
      paymentMethodId: data.paymentMethodId,
      email: data.email,
    });
    setIsProcessing(true);
    setError('');
    try {
      const result = await api.mpCreateSubscription({
        planKey: selectedPlanId,
        companyId: currentCompany.id,
        cardTokenId: data.token,
        payerEmail: data.email || currentUser?.email || '',
      });
      console.log('[MP] SubscriptionPage: Create subscription result:', result);

      if (result.success && result.status === 'active') {
        console.log('[MP] SubscriptionPage: Subscription active, navigating to dashboard');
        await refreshCompany(true);
        navigate(ROUTE_PATHS.DASHBOARD);
      } else {
        console.warn('[MP] SubscriptionPage: Subscription not immediately active, status:', result.status);
        setError('La suscripcion fue creada pero aun esta pendiente de confirmacion.');
        await refreshCompany(true);
        navigate(ROUTE_PATHS.DASHBOARD);
      }
    } catch (err) {
      console.error('[MP] SubscriptionPage: Create subscription error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Error al crear la suscripcion. Intente nuevamente.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={3}>
      <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Elija su Plan</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Seleccione el plan que mejor se adapte a sus necesidades.
          </p>
        </div>

        {/* Free Trial Option */}
        {canStartTrial && (
          <div className="mb-4 p-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Prueba gratuita de 14 dias</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Explore todas las funcionalidades sin compromiso. No se requieren datos de pago.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartTrial}
                disabled={isActivatingTrial}
                className="flex-shrink-0 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {isActivatingTrial ? 'Activando...' : 'Comenzar prueba gratuita'}
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
          {/* Plans Column - Takes 3/5 */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            {plansData.map((plan) => (
              <div
                key={plan.id}
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  setError('');
                }}
                className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white ${selectedPlanId === plan.id
                    ? 'border-gray-900 ring-1 ring-gray-900'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                {/* Radio indicator */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedPlanId === plan.id ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                    }`}
                >
                  {selectedPlanId === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                {/* Plan info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    {plan.tag && (
                      <span className="text-xs font-semibold tracking-wide rounded-full bg-gray-900 text-white px-2 py-0.5">
                        {plan.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {plan.features.map((feature, index) => (
                      <span key={index} className="text-xs text-gray-500 flex items-center gap-1">
                        <CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  {paymentMethod === 'mercadopago' ? (
                    <>
                      <span className="text-2xl font-semibold text-gray-900">{mpPlansData[plan.id]?.priceArs}</span>
                      <span className="text-sm text-gray-500">/mes</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-semibold text-gray-900">{plan.price}</span>
                      <span className="text-sm text-gray-500">{plan.priceSuffix}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Confirmation Column - Takes 2/5 */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Metodo de pago</h3>

              {/* Payment method selector */}
              {isMpEnabled && (
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('mercadopago'); setError(''); }}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                      paymentMethod === 'mercadopago'
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('paypal'); setError(''); }}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    PayPal
                  </button>
                </div>
              )}

              <div className="flex-1 flex flex-col relative">
                {/* Processing overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-gray-50/90 flex items-center justify-center z-10 rounded-lg">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Procesando suscripcion...</p>
                    </div>
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-center">
                  {/* MercadoPago Card Form */}
                  {paymentMethod === 'mercadopago' && currentCompany && (
                    <CardForm
                      key={selectedPlanId}
                      amount={selectedMpPrice?.priceNumberArs || 0}
                      onTokenReady={handleMpTokenReady}
                      onError={(msg) => setError(msg)}
                      isProcessing={isProcessing}
                    />
                  )}

                  {/* PayPal Buttons */}
                  {paymentMethod === 'paypal' && currentCompany && (
                    <PayPalScriptProvider options={paypalScriptOptions}>
                      <PayPalButtons
                        key={selectedPlanId}
                        style={{
                          layout: 'vertical',
                          label: 'subscribe',
                          shape: 'pill',
                          color: 'black',
                          height: 45,
                          tagline: false,
                        }}
                        createSubscription={async () => {
                          setError('');
                          try {
                            const result = await api.createSubscription({
                              planKey: selectedPlanId,
                              companyId: currentCompany.id,
                            });
                            return result.subscriptionId;
                          } catch (err) {
                            setError('Error al crear la suscripcion. Intente nuevamente.');
                            throw err;
                          }
                        }}
                        onApprove={async (data) => {
                          setIsProcessing(true);
                          setError('');
                          try {
                            const result = await api.activateSubscription({
                              subscriptionId: data.subscriptionID!,
                              companyId: currentCompany.id,
                            });

                            if (result.success && result.status === 'active') {
                              await refreshCompany(true);
                              navigate(ROUTE_PATHS.DASHBOARD);
                            } else if (result.status === 'pending') {
                              await refreshCompany(true);
                              navigate(ROUTE_PATHS.DASHBOARD);
                            } else {
                              setError(result.message || 'Error inesperado al activar la suscripcion.');
                            }
                          } catch (err) {
                            console.error('Activation error:', err);
                            setError('Error al activar la suscripcion. Contacte soporte.');
                          } finally {
                            setIsProcessing(false);
                          }
                        }}
                        onCancel={() => {
                          setError('El pago fue cancelado. Puede intentar nuevamente.');
                        }}
                        onError={(err) => {
                          console.error('PayPal error:', err);
                          setError('Ocurrio un error con PayPal. Intente nuevamente.');
                          setIsProcessing(false);
                        }}
                      />
                    </PayPalScriptProvider>
                  )}
                </div>
              </div>

              {error && <p className="text-sm text-red-600 text-center py-2 mt-2">{error}</p>}

              {/* Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Total mensual</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {paymentMethod === 'mercadopago'
                      ? selectedMpPrice?.priceArs
                      : selectedPlanDetails?.price}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(ROUTE_PATHS.CREATE_COMPANY)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  &larr; Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SubscriptionPage;
