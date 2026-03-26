import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { STATUS_CONFIG, formatBillingDate } from './billingConstants';
import type { Subscription } from '@/types/subscription';

interface ActivePlanCardProps {
  subscription: Subscription;
  canChangePlan: boolean;
  onChangePlan: () => void;
}

export const ActivePlanCard = ({ subscription, canChangePlan, onChangePlan }: ActivePlanCardProps) => {
  const statusConfig = STATUS_CONFIG[subscription.status] || STATUS_CONFIG.pending;
  const isBankTransfer = subscription.paymentProvider === 'bank_transfer';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-foreground">Plan</h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${statusConfig.className}`}
          >
            {statusConfig.label}
          </span>
        </div>
        {canChangePlan && !isBankTransfer && (
          <Button type="button" variant="ghost" onClick={onChangePlan}>
            Cambiar plan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Plan</p>
          <p className="text-sm font-medium text-foreground">{subscription.planName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Precio mensual</p>
          <p className="text-sm font-medium text-foreground">
            {formatCurrency(subscription.amount, subscription.currency)}
          </p>
        </div>
        <div>
          {isBankTransfer ? (
            <>
              <p className="text-xs text-muted-foreground mb-1">Método de pago</p>
              <p className="text-sm font-medium text-foreground">Transferencia bancaria</p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-1">Proximo cobro</p>
              <p className="text-sm font-medium text-foreground">
                {formatBillingDate(subscription.nextBillingTime)}
              </p>
            </>
          )}
        </div>
      </div>

      {subscription.activatedAt && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Suscripcion activa desde {formatBillingDate(subscription.activatedAt)}
          </p>
        </div>
      )}
    </div>
  );
};
