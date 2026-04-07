import { Button } from '@/components/ui/button';
import { CheckIcon, CreditCardIcon } from '@/components/common/Icons';
import { Building2 } from 'lucide-react';
import type { Plan } from '@/types/company';

interface NewSubscriptionSectionProps {
  plans: Plan[];
  selectedPlanId: string;
  paymentMethod: 'card' | 'bank_transfer';
  planError: string;
  onSelectPlan: (planId: string) => void;
  onSelectPaymentMethod: (method: 'card' | 'bank_transfer') => void;
  onContinue: () => void;
}

export const NewSubscriptionSection = ({
  plans,
  selectedPlanId,
  paymentMethod,
  planError,
  onSelectPlan,
  onSelectPaymentMethod,
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

      {/* Payment method picker */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Método de pago</p>
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => onSelectPaymentMethod('card')}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              paymentMethod === 'card'
                ? 'border-primary ring-1 ring-primary bg-background'
                : 'border-border hover:border-border bg-background'
            }`}
          >
            <CreditCardIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Tarjeta</p>
              <p className="text-xs text-muted-foreground">Crédito o débito</p>
            </div>
          </div>
          <div
            onClick={() => onSelectPaymentMethod('bank_transfer')}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              paymentMethod === 'bank_transfer'
                ? 'border-primary ring-1 ring-primary bg-background'
                : 'border-border hover:border-border bg-background'
            }`}
          >
            <Building2 className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-foreground">Transferencia</p>
              <p className="text-xs text-muted-foreground">Bancaria</p>
            </div>
          </div>
        </div>
        <Button onClick={onContinue} className="w-full">
          Continuar
        </Button>
      </div>

      {planError && <p className="text-sm text-destructive text-center mt-3">{planError}</p>}
    </>
  );
};
