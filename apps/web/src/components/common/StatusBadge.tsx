import { CircleCheck, Clock4, CircleX } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  valid: {
    label: 'Vigente',
    icon: CircleCheck,
    classes: 'bg-brand-50 text-brand-800 border-brand-200',
    iconClass: 'text-brand-600',
  },
  expiring: {
    label: 'Por vencer',
    icon: Clock4,
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    iconClass: 'text-amber-600',
  },
  expired: {
    label: 'Vencido',
    icon: CircleX,
    classes: 'bg-red-50 text-red-800 border-red-200',
    iconClass: 'text-red-600',
  },
};

interface StatusBadgeProps {
  status: 'valid' | 'expiring' | 'expired';
  className?: string;
  showIcon?: boolean;
  customLabel?: string;
}

export const StatusBadge = ({
  status,
  className,
  showIcon = true,
  customLabel,
}: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium',
        config.classes,
        className
      )}
    >
      {showIcon && <Icon className={cn('w-3.5 h-3.5', config.iconClass)} />}
      <span>{customLabel || config.label}</span>
    </span>
  );
};
