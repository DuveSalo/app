import { CircleCheck, Clock4, CircleX } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  valid: {
    label: 'Vigente',
    icon: CircleCheck,
    classes: 'bg-[#ecfdf5] text-green-700 border-[#a7f3d0]',
    iconClass: 'text-green-700',
  },
  expiring: {
    label: 'Por vencer',
    icon: Clock4,
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    iconClass: 'text-amber-700',
  },
  expired: {
    label: 'Vencido',
    icon: CircleX,
    classes: 'bg-red-50 text-red-700 border-red-200',
    iconClass: 'text-red-700',
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
        'inline-flex items-center gap-1.5 py-0.5 px-2 rounded-md border text-xs font-medium',
        config.classes,
        className
      )}
    >
      {showIcon && <Icon className={cn('w-3.5 h-3.5', config.iconClass)} />}
      <span>{customLabel || config.label}</span>
    </span>
  );
};
