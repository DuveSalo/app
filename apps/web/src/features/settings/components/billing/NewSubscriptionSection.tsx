import { Button } from '@/components/ui/button';
import { CheckIcon } from '@/components/common/Icons';
import type { Plan } from '@/types/company';

interface NewSubscriptionSectionProps {
  plans: Plan[];
  selectedPlanId: string;
  planError: string;
  onSelectPlan: (planId: string) => void;
  onContinue: () => void;
}

export const NewSubscriptionSection = ({
  plans,
  selectedPlanId,
  planError,
  onSelectPlan,
  onContinue,
}: NewSubscriptionSectionProps) => {
  if (plans.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No hay planes disponibles en este momento.</p>
    );
  }

  return (
    <>
      {/* Plan cards */}
      <div className="space-y-2 mb-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onSelectPlan(plan.id)}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              selectedPlanId === plan.id
                ? 'border-primary ring-1 ring-primary bg-background'
                : 'border-border hover:border-border bg-background'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedPlanId === plan.id ? 'border-primary bg-primary' : 'border-border'
              }`}
            >
              {selectedPlanId === plan.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-background" />
              )}
            </div>
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
            <div className="text-right flex-shrink-0">
              <span className="text-lg font-bold text-foreground">{plan.price}</span>
              <span className="text-xs text-muted-foreground">{plan.priceSuffix}</span>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={onContinue} className="w-full">
        Continuar con transferencia bancaria
      </Button>

      {planError && <p className="text-sm text-destructive text-center mt-3">{planError}</p>}
    </>
  );
};
