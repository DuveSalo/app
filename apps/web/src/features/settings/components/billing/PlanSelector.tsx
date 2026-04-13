import { useState } from 'react';
import { CheckIcon } from '@/components/common/Icons';
import { CardForm } from '@/features/auth/components/CardForm';
import { toast } from 'sonner';
import type { Plan } from '@/types/company';

interface PlanSelectorProps {
  plans: Plan[];
  userEmail?: string;
  onCreateSubscription: (data: {
    planKey: string;
    cardTokenId: string;
    payerEmail: string;
    cardBrand?: string | null;
    cardLastFour?: string | null;
    paymentTypeId?: string | null;
  }) => Promise<void>;
}

export const PlanSelector = ({ plans, userEmail, onCreateSubscription }: PlanSelectorProps) => {
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || 'basic');
  const [planError, setPlanError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">Selecciona un plan para suscribirte</p>

      {/* Plan cards */}
      <div className="space-y-2 mb-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => {
              setSelectedPlanId(plan.id);
              setPlanError('');
            }}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              selectedPlanId === plan.id
                ? 'border-primary ring-1 ring-primary bg-background'
                : 'border-border hover:border-border bg-background'
            }`}
          >
            {/* Radio */}
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedPlanId === plan.id ? 'border-primary bg-primary' : 'border-border'
              }`}
            >
              {selectedPlanId === plan.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-background" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{plan.name}</span>
                {plan.tag && (
                  <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-lg">
                    {plan.tag}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                {plan.features.map((f, i) => (
                  <span key={i} className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
              <span className="text-lg font-bold text-foreground">{plan.price}</span>
              <span className="text-xs text-muted-foreground">{plan.priceSuffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Form */}
      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Procesando suscripción...</p>
            </div>
          </div>
        )}

        <CardForm
          key={selectedPlanId}
          amount={plans.find((p) => p.id === selectedPlanId)?.priceNumber || 0}
          onTokenReady={async (data) => {
            setPlanError('');
            setIsProcessing(true);
            try {
              await onCreateSubscription({
                planKey: selectedPlanId,
                cardTokenId: data.token,
                payerEmail: data.email || userEmail || '',
                cardBrand: data.paymentMethodId || null,
                cardLastFour: data.lastFourDigits,
                paymentTypeId: data.paymentTypeId,
              });
            } catch (err) {
              console.error('[MP] PlanSelector: Create subscription error:', err);
              const msg = 'Error al crear la suscripción. Intente nuevamente.';
              setPlanError(msg);
              toast.error(msg);
            } finally {
              setIsProcessing(false);
            }
          }}
          onError={(msg) => setPlanError(msg)}
          isProcessing={isProcessing}
        />
      </div>

      {planError && <p className="text-sm text-destructive text-center mt-3">{planError}</p>}
    </div>
  );
};
