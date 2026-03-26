import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ColorBadge } from '@/components/common/StatusBadge';
import { PaymentMethodBadge } from './PaymentMethodBadge';
import { formatDateLocal, formatCurrency } from '@/lib/utils/dateUtils';
import type { AdminPaymentRow } from '../types';

const statusConfig: Record<string, { variant: 'emerald' | 'amber' | 'red' | 'muted'; label: string }> = {
  pending: { variant: 'amber', label: 'Pendiente' },
  approved: { variant: 'emerald', label: 'Aprobado' },
  rejected: { variant: 'red', label: 'Rechazado' },
};

interface PaymentDetailDialogProps {
  open: boolean;
  onClose: () => void;
  payment: AdminPaymentRow | null;
  onViewReceipt?: (payment: AdminPaymentRow) => void;
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
}: PaymentDetailDialogProps) => {
  if (!payment) return null;

  const config = statusConfig[payment.status] || { variant: 'muted' as const, label: payment.status };
  const periodEnd = computePeriodEnd(payment);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle del pago</DialogTitle>
          <DialogDescription className="sr-only">Información detallada del pago</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <DetailRow label="Escuela" value={payment.companyName} />
          <DetailRow label="Monto" value={formatCurrency(payment.amount)} />
          <DetailRow label="Método">
            <PaymentMethodBadge method={payment.paymentMethod} />
          </DetailRow>
          {payment.cardBrand && (
            <DetailRow
              label="Tarjeta"
              value={
                payment.cardLastFour
                  ? `${payment.cardBrand.charAt(0).toUpperCase() + payment.cardBrand.slice(1)} •••• ${payment.cardLastFour}`
                  : payment.cardBrand.charAt(0).toUpperCase() + payment.cardBrand.slice(1)
              }
            />
          )}
          <DetailRow label="Estado">
            <ColorBadge variant={config.variant} label={config.label} />
          </DetailRow>
          <DetailRow label="Fecha de pago" value={formatDateLocal(payment.createdAt)} />
          {periodEnd && (
            <DetailRow label="Vigencia hasta" value={formatDateLocal(periodEnd)} />
          )}
          {payment.rejectionReason && (
            <DetailRow label="Motivo de rechazo" value={payment.rejectionReason} />
          )}

          {payment.paymentMethod === 'bank_transfer' && payment.receiptUrl && onViewReceipt && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onViewReceipt(payment)}
            >
              Ver comprobante
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
