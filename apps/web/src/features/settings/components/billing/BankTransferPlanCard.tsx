import { STATUS_CONFIG, formatBillingDate } from './billingConstants';
import type { Subscription } from '@/types/subscription';

interface BankTransferPlanCardProps {
  subscription: Subscription;
}

export const BankTransferPlanCard = ({ subscription }: BankTransferPlanCardProps) => {
  const statusConfig = STATUS_CONFIG[subscription.status] || STATUS_CONFIG.pending;
  const planName = subscription.planName;
  const nextPaymentDate = subscription.nextBillingTime ?? subscription.currentPeriodEnd;

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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Plan</p>
          <p className="text-sm font-medium text-foreground">{planName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Método de pago</p>
          <p className="text-sm font-medium text-foreground">Transferencia bancaria</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Estado</p>
          <p className="text-sm font-medium text-foreground">{statusConfig.label}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-1">Próximo pago</p>
        <p className="text-sm font-medium text-foreground">{formatBillingDate(nextPaymentDate)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Corresponde al vencimiento del período abonado.
        </p>
      </div>
    </div>
  );
};
