import { ReceiptIcon } from '@/components/common/Icons';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { PAYMENT_STATUS_CONFIG, formatBillingDate } from './billingConstants';
import type { PaymentTransaction } from '@/types/subscription';

interface PaymentHistorySectionProps {
  payments: PaymentTransaction[];
}

export const PaymentHistorySection = ({ payments }: PaymentHistorySectionProps) => {
  if (payments.length === 0) return null;

  return (
    <div className="border-t border-border pt-5 mt-5">
      <div className="flex items-center gap-2 mb-4">
        <ReceiptIcon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-medium text-foreground">Historial de pagos</h3>
      </div>
      <div className="space-y-3">
        {payments.map((payment) => {
          const paymentStatus =
            PAYMENT_STATUS_CONFIG[payment.status] || PAYMENT_STATUS_CONFIG.pending;
          return (
            <div
              key={payment.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div>
                <p className="text-sm text-foreground">
                  {formatCurrency(payment.grossAmount, payment.currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBillingDate(payment.paidAt)}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${paymentStatus.className}`}
              >
                {paymentStatus.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
