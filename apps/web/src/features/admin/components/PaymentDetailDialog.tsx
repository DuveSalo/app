import { useState } from 'react';
import { FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ColorBadge } from '@/components/common/StatusBadge';
import { PaymentMethodBadge } from './PaymentMethodBadge';
import { RejectPaymentDialog } from './RejectPaymentDialog';
import { formatDateLocal, formatCurrency } from '@/lib/utils/dateUtils';
import type { AdminPaymentRow } from '../types';

const statusConfig: Record<
  string,
  { variant: 'emerald' | 'amber' | 'red' | 'muted'; label: string }
> = {
  pending: { variant: 'amber', label: 'Pendiente' },
  approved: { variant: 'emerald', label: 'Aprobado' },
  rejected: { variant: 'red', label: 'Rechazado' },
};

interface PaymentDetailDialogProps {
  open: boolean;
  onClose: () => void;
  payment: AdminPaymentRow | null;
  onViewReceipt?: (payment: AdminPaymentRow) => void;
  onApprove?: (paymentId: string) => void;
  onReject?: (paymentId: string, reason: string) => void;
}

function computePeriodEnd(payment: AdminPaymentRow): string | null {
  if (payment.periodEnd) return payment.periodEnd;
  // Plans are monthly — compute end as start + 1 month
  const start = payment.periodStart || payment.createdAt;
  if (!start) return null;
  const d = new Date(start);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

export const PaymentDetailDialog = ({
  open,
  onClose,
  payment,
  onViewReceipt,
  onApprove,
  onReject,
}: PaymentDetailDialogProps) => {
  const [rejectOpen, setRejectOpen] = useState(false);

  if (!payment) return null;

  const config = statusConfig[payment.status] || {
    variant: 'muted' as const,
    label: payment.status,
  };
  const periodEnd = computePeriodEnd(payment);
  const showActions =
    payment.status === 'pending' &&
    payment.paymentMethod === 'bank_transfer' &&
    onApprove !== undefined &&
    onReject !== undefined;
  const showReceiptAction =
    payment.paymentMethod === 'bank_transfer' && onViewReceipt !== undefined;

  const handleRejectConfirm = (reason: string) => {
    setRejectOpen(false);
    onReject!(payment.id, reason);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del pago</DialogTitle>
            <DialogDescription className="sr-only">
              Información detallada del pago
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <DetailRow label="Escuela" value={payment.companyName} />
            <DetailRow label="Monto" value={formatCurrency(payment.amount)} />
            <DetailRow label="Método">
              <PaymentMethodBadge method={payment.paymentMethod} />
            </DetailRow>
            <DetailRow label="Estado">
              <ColorBadge variant={config.variant} label={config.label} />
            </DetailRow>
            {showReceiptAction && (
              <DetailRow label="Comprobante">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!payment.receiptUrl}
                  title={!payment.receiptUrl ? 'No hay PDF adjunto' : undefined}
                  onClick={() => onViewReceipt(payment)}
                >
                  <FileText className="h-4 w-4" />
                  Ver PDF
                </Button>
              </DetailRow>
            )}
            <DetailRow label="Fecha de pago" value={formatDateLocal(payment.createdAt)} />
            {periodEnd && <DetailRow label="Vigencia hasta" value={formatDateLocal(periodEnd)} />}
            {payment.rejectionReason && (
              <DetailRow label="Motivo de rechazo" value={payment.rejectionReason} />
            )}
          </div>

          {showActions && (
            <DialogFooter>
              <Button variant="destructive" onClick={() => setRejectOpen(true)}>
                Rechazar
              </Button>
              <Button variant="outline" onClick={() => onApprove!(payment.id)}>
                Aprobar
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {showActions && (
        <RejectPaymentDialog
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
          onConfirm={handleRejectConfirm}
        />
      )}
    </>
  );
};

function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children || <span className="text-sm font-medium text-right">{value}</span>}
    </div>
  );
}
