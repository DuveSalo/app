import { StatusBadge } from '@/components/common/StatusBadge';
import { calculateExpirationStatus, formatDateLocal } from '@/lib/utils/dateUtils';
import type { SelfProtectionSystem } from '@/types/index';

const formatOptionalDate = (value?: string) => (value ? formatDateLocal(value) : 'Sin fecha');

interface SelfProtectionSystemMobileCardProps {
  system: SelfProtectionSystem;
  onSelect: () => void;
}

export const SelfProtectionSystemMobileCard = ({
  system,
  onSelect,
}: SelfProtectionSystemMobileCardProps) => {
  const expirationStatus = calculateExpirationStatus(system.expirationDate);

  return (
    <button
      key={system.id}
      type="button"
      className="w-full text-left border rounded-lg p-4 bg-card"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{system.intervener}</span>
        <StatusBadge status={expirationStatus} />
      </div>
      <div className="mt-1 text-sm text-muted-foreground">
        Matricula {system.registrationNumber || 'sin registrar'}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Vencimiento: {formatOptionalDate(system.expirationDate)}
      </div>
    </button>
  );
};
