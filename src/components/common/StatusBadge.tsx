

import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
  {
    variants: {
      status: {
        valid: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
        expiring: 'bg-amber-50 text-amber-700 border-amber-200/50',
        expired: 'bg-red-50 text-red-700 border-red-200/50',
      },
    },
    defaultVariants: {
      status: 'valid',
    },
  }
);

const statusConfig = {
  valid: {
    label: 'Vigente',
    icon: CheckCircle,
  },
  expiring: {
    label: 'Por vencer',
    icon: Clock,
  },
  expired: {
    label: 'Vencido',
    icon: AlertCircle,
  },
};

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
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
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(badgeVariants({ status }), className)}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {customLabel || config.label}
    </span>
  );
};
