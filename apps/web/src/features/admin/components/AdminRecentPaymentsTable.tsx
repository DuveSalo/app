import { Eye, FileText, CreditCard, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColorBadge } from '@/components/common/StatusBadge';
import { formatDateLocal, formatCurrency } from '@/lib/utils/dateUtils';
import type { AdminPaymentRow } from '../types';
import { PaymentMethodBadge } from './PaymentMethodBadge';

const paymentStatusConfig: Record<
  string,
  { variant: 'emerald' | 'amber' | 'red' | 'muted'; label: string }
> = {
  pending: { variant: 'amber', label: 'Pendiente' },
  approved: { variant: 'emerald', label: 'Aprobado' },
  rejected: { variant: 'red', label: 'Rechazado' },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const config = paymentStatusConfig[status] || { variant: 'muted' as const, label: status };
  return <ColorBadge variant={config.variant} label={config.label} />;
}

interface AdminRecentPaymentsTableProps {
  payments: AdminPaymentRow[];
  onViewDetails: (payment: AdminPaymentRow) => void;
  onViewReceipt: (payment: AdminPaymentRow) => void;
}

export function AdminRecentPaymentsTable({
  payments,
  onViewDetails,
  onViewReceipt,
}: AdminRecentPaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <section>
        <h2 className="text-base font-medium mb-3">Ventas recientes</h2>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg">
          <CreditCard className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">No hay ventas recientes</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-base font-medium mb-3">Ventas recientes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {payments.map((payment) => {
          const isBankTransfer = payment.paymentMethod === 'bank_transfer';
          return (
            <div key={payment.id} className="border rounded-lg bg-card p-4 flex flex-col gap-3">
              {/* Amount + Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Monto</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
                <PaymentStatusBadge status={payment.status} />
              </div>

              {/* School name */}
              <div className="flex items-center gap-1.5 text-sm">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="font-medium truncate">{payment.companyName}</span>
              </div>

              {/* Footer: method + date + actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 min-w-0">
                  <PaymentMethodBadge
                    method={payment.paymentMethod}
                    cardBrand={payment.cardBrand}
                    cardLastFour={payment.cardLastFour}
                  />
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDateLocal(payment.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onViewDetails(payment)}
                    title="Ver detalles"
                    aria-label={`Ver detalles de ${payment.companyName}`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </Button>
                  {isBankTransfer && payment.receiptUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onViewReceipt(payment)}
                      title="Ver comprobante"
                      aria-label={`Ver comprobante de ${payment.companyName}`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
