
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '../../components/common/Button';
import { CheckIcon } from '../../components/common/Icons';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS } from '../../constants/index';
import { Plan } from '../../types/index';

export const plansData: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$29.000',
    priceNumber: 29000,
    priceSuffix: '/mes',
    features: ['Gestion de 5 modulos', 'Dashboard de vencimientos', 'Soporte por email'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$59.000',
    priceNumber: 59000,
    priceSuffix: '/mes',
    features: ['Gestion de 10 modulos', 'Alertas avanzadas', 'Soporte prioritario'],
    tag: 'Mas Popular',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$99.000',
    priceNumber: 99000,
    priceSuffix: '/mes',
    features: ['Modulos ilimitados', 'Reportes personalizados', 'Soporte 24/7 por telefono'],
  },
];

const SubscriptionPage: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plansData[1].id);
  const [error, setError] = useState('');
  const { currentCompany } = useAuth();
  const navigate = useNavigate();

  const selectedPlanDetails = plansData.find((p) => p.id === selectedPlanId);

  const handleSelectPlan = () => {
    console.log('[SubscriptionPage] handleSelectPlan called', { currentCompany, selectedPlanId });
    if (!currentCompany) {
      console.error('[SubscriptionPage] No company found');
      setError('No se encontro la empresa. Por favor, vuelva a crear su empresa.');
      return;
    }
    // Navigate to checkout with selected plan
    const checkoutUrl = `${ROUTE_PATHS.SUBSCRIPTION_CHECKOUT}?plan=${selectedPlanId}`;
    console.log('[SubscriptionPage] Navigating to:', checkoutUrl);
    navigate(checkoutUrl);
  };

  const wizardSteps = ['Cuenta', 'Empresa', 'Suscripcion'];

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
                      <span className="text-[10px] font-semibold tracking-wide rounded-full bg-gray-900 text-white px-2 py-0.5">
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
                  <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.priceSuffix}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Confirmation Column - Takes 2/5 */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Confirmacion</h3>

              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-500 text-center">
                    Seleccione un plan y haga clic en "Continuar al Pago" para completar su suscripcion.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleSelectPlan}
                  className="w-full mt-4"
                >
                  Continuar al Pago
                </Button>
              </div>

              {error && <p className="text-sm text-red-600 text-center py-2 mt-2">{error}</p>}

              {/* Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Total mensual</span>
                  <span className="text-lg font-bold text-gray-900">
                    {selectedPlanDetails?.price}
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
