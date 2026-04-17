import { ColorBadge } from '@/components/common/StatusBadge';

type ColorVariant = 'emerald' | 'amber' | 'red' | 'muted';

function getStatusConfig(status: string): { variant: ColorVariant; label: string } {
  switch (status) {
    case 'active':
      return { variant: 'emerald', label: 'Activa' };
    case 'trial':
      return { variant: 'emerald', label: 'Prueba gratis' };
    case 'trial_expired':
      return { variant: 'red', label: 'Prueba expirada' };
    case 'pending':
    case 'approval_pending':
      return { variant: 'amber', label: 'Pendiente' };
    case 'rejected':
      return { variant: 'red', label: 'Rechazado' };
    case 'suspended':
      return { variant: 'amber', label: 'Suspendida' };
    case 'cancelled':
    case 'expired':
      return { variant: 'red', label: status === 'expired' ? 'Expirada' : 'Cancelada' };
    default:
      return { variant: 'muted', label: status || 'Sin suscripción' };
  }
}

export function SubscriptionStatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status);
  return <ColorBadge variant={config.variant} label={config.label} />;
}
