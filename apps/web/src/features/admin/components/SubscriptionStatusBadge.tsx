import { ColorBadge } from '@/components/common/StatusBadge';

type ColorVariant = 'emerald' | 'amber' | 'red' | 'muted';

const statusConfig: Record<string, { variant: ColorVariant; label: string }> = {
  active: { variant: 'emerald', label: 'Activa' },
  pending: { variant: 'amber', label: 'Pendiente' },
  approval_pending: { variant: 'amber', label: 'Pendiente aprobacion' },
  suspended: { variant: 'red', label: 'Suspendida' },
  cancelled: { variant: 'red', label: 'Cancelada' },
  expired: { variant: 'red', label: 'Expirada' },
};

export function SubscriptionStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { variant: 'muted' as ColorVariant, label: status };

  return <ColorBadge variant={config.variant} label={config.label} />;
}
