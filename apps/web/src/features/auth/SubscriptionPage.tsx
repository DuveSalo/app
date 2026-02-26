import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Check } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS } from '../../constants/index';
import { Plan } from '../../types/index';
import { CardForm } from './components/CardForm';
import * as api from '../../lib/api/services';

export const plansData: Plan[] = [
  {
    id: 'trial',
    name: 'Prueba Gratis',
    price: '$0',
    priceNumber: 0,
    priceSuffix: '/14 dias',
    features: ['Acceso completo', 'Sin tarjeta', '14 dias'],
  },
  {
    id: 'basic',
    name: 'Basico',
    price: '$25.000',
    priceNumber: 25000,
    priceSuffix: '/mes',
    features: ['5 modulos', 'Dashboard', 'Soporte email'],
  },
  {
    id: 'standard',
    name: 'Estandar',
    price: '$59.000',
    priceNumber: 59000,
    priceSuffix: '/mes',
    features: ['10 modulos', 'Alertas', 'Soporte prioritario'],
    tag: 'Recomendado',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$89.000',
    priceNumber: 89000,
    priceSuffix: '/mes',
    features: ['Ilimitado', 'Reportes', 'Soporte 24/7'],
  },
];

const SubscriptionPage = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('standard');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentCompany, currentUser, refreshCompany } = useAuth();
  const navigate = useNavigate();

  const selectedPlan = plansData.find((p) => p.id === selectedPlanId);

  const handleStartTrial = async () => {
    if (!currentCompany) return;
    setIsProcessing(true);
    setError('');
    try {
      await api.activateTrial(currentCompany.id);
      await refreshCompany(true);
      navigate(ROUTE_PATHS.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al activar la prueba.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (selectedPlanId === 'trial') {
      await handleStartTrial();
      return;
    }
    // For paid plans, CardForm handles tokenization
  };

  const handleTokenReady = async (data: { token: string; paymentMethodId: string; email: string }) => {
    if (!currentCompany) return;
    setIsProcessing(true);
    setError('');
    try {
      const result = await api.mpCreateSubscription({
        planKey: selectedPlanId,
        companyId: currentCompany.id,
        cardTokenId: data.token,
        payerEmail: data.email || currentUser?.email || '',
      });
      if (result.success) {
        await refreshCompany(true);
        navigate(ROUTE_PATHS.DASHBOARD);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la suscripcion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const wizardSteps = ['Cuenta', 'Empresa', 'Suscripcion'];

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={3}>
      <div className="bg-white border border-neutral-200 rounded-md flex flex-col w-full max-w-[860px] p-10 gap-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-medium text-neutral-900 text-center">
            Elija su plan
          </h2>
          <p className="text-sm font-light text-neutral-500 text-center">
            Todos los planes incluyen acceso completo a la plataforma.
          </p>
        </div>

        {/* Plans row */}
        <div className="flex gap-4">
          {plansData.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`flex-1 flex flex-col text-left p-5 gap-4 rounded-md transition-colors focus:outline-none ${
                  isSelected
                    ? 'border-2 border-neutral-900'
                    : 'border border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Plan name + tag */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium text-neutral-900">
                    {plan.name}
                  </span>
                  {plan.tag && (
                    <span className="text-xs font-medium text-white bg-neutral-900 px-2 py-0.5 rounded-md">
                      {plan.tag}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold tracking-tight text-neutral-900">
                    {plan.price}
                  </span>
                  <span className="text-sm font-light text-neutral-500 pb-1">
                    {plan.priceSuffix}
                  </span>
                </div>

                {/* Features */}
                <div className="flex flex-col gap-2">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-neutral-900" />
                      <span className="text-sm font-light text-neutral-500">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Payment form for paid plans */}
        {selectedPlanId !== 'trial' && currentCompany && (
          <div className="border border-neutral-200 rounded-md p-5">
            <h3 className="text-sm font-medium text-neutral-900 mb-4">
              Metodo de pago
            </h3>
            <CardForm
              key={selectedPlanId}
              amount={selectedPlan?.priceNumber || 0}
              onTokenReady={handleTokenReady}
              onError={(msg) => setError(msg)}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-neutral-200" />

        {/* Summary */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-light text-neutral-500">Total mensual</span>
          <span className="text-xl font-bold text-neutral-900">
            {selectedPlan?.price || '$0'}
          </span>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.CREATE_COMPANY)}
            className="text-sm font-light text-neutral-500 focus:outline-none"
          >
            &larr; Volver
          </button>
          {selectedPlanId === 'trial' && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex items-center justify-center px-8 py-3 bg-neutral-900 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 focus:outline-none hover:bg-neutral-800"
            >
              {isProcessing ? 'Procesando...' : 'Confirmar Suscripcion'}
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default SubscriptionPage;
