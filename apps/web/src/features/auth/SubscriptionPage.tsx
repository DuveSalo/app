import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTE_PATHS } from '../../constants/index';
import { BankDetailsCard } from './components/BankDetailsCard';
import { usePlans } from '../../lib/hooks/usePlans';
import * as api from '../../lib/api/services';

const wizardSteps = ['Crear Cuenta', 'Registrar Escuela', 'Suscripción'];

const SubscriptionPage = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('standard');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentCompany, pendingCompanyData, setCompany, refreshCompany } = useAuth();
  const navigate = useNavigate();
  const { plans: plansData, isLoading: plansLoading } = usePlans({ includeTrial: true });

  useEffect(() => {
    if (plansData.length === 0) return;
    if (plansData.some((plan) => plan.id === selectedPlanId)) return;
    setSelectedPlanId(plansData[0].id);
  }, [plansData, selectedPlanId]);

  const selectedPlan = plansData.find((plan) => plan.id === selectedPlanId);

  const ensureCompany = async () => {
    if (currentCompany) return currentCompany;
    if (!pendingCompanyData) {
      throw new Error('No hay datos de la escuela. Volve al paso anterior.');
    }

    const newCompany = await api.createCompany(pendingCompanyData);
    setCompany(newCompany);
    return newCompany;
  };

  const handleStartTrial = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const company = await ensureCompany();
      await api.activateTrial(company.id);
      await refreshCompany(true);
      navigate(ROUTE_PATHS.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al activar la prueba.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankTransferConfirm = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    setError('');

    try {
      const company = await ensureCompany();
      await api.submitBankTransferPayment({
        companyId: company.id,
        planKey: selectedPlanId,
        amount: selectedPlan.priceNumber || 0,
      });
      await refreshCompany(true);
      navigate(ROUTE_PATHS.BANK_TRANSFER_UPLOAD);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la transferencia.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={3}>
      <Card className="w-full max-w-[1080px] gap-4 py-4">
        <CardContent className="flex flex-col gap-4 p-6 sm:p-7">
          <div className="flex flex-col items-center gap-1.5">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground">
              Elegi tu plan
            </h2>
            <p className="text-center text-sm text-muted-foreground">
              Todos los planes incluyen acceso completo a la plataforma.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {plansLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-lg border border-border p-5"
                >
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}

            {!plansLoading &&
              plansData.map((plan) => {
                const isSelected = selectedPlanId === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    aria-pressed={isSelected}
                    className={`flex flex-col gap-3 rounded-lg p-5 text-left transition-colors focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                      isSelected
                        ? 'border-2 border-primary'
                        : 'border border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="text-sm font-medium text-foreground">{plan.name}</span>
                      {plan.tag && <Badge>{plan.tag}</Badge>}
                    </div>

                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold tracking-tight text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground pb-1">{plan.priceSuffix}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 shrink-0 text-foreground" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
          </div>

          {selectedPlanId !== 'trial' && (currentCompany || pendingCompanyData) && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-foreground">Datos para transferencia</h3>

              <div className="rounded-lg border border-border p-3.5">
                <BankDetailsCard />
              </div>
            </div>
          )}

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Total mensual</span>
            <span className="text-xl font-bold text-foreground">{selectedPlan?.price || '$0'}</span>
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(ROUTE_PATHS.CREATE_COMPANY)}
            >
              &larr; Volver
            </Button>

            <div className="flex justify-end gap-3">
              {selectedPlanId === 'trial' && (
                <Button onClick={handleStartTrial} loading={isProcessing}>
                  {isProcessing ? 'Procesando...' : 'Activar prueba'}
                </Button>
              )}

              {selectedPlanId !== 'trial' && (
                <Button onClick={handleBankTransferConfirm} loading={isProcessing}>
                  {isProcessing ? 'Procesando...' : 'Confirmar'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default SubscriptionPage;
