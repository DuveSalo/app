import { CircleCheck, Clock4, CircleX, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  valid: {
    label: 'Vigente',
    icon: CircleCheck,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  expiring: {
    label: 'Por vencer',
    icon: Clock4,
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  expired: {
    label: 'Vencido',
    icon: CircleX,
    classes: 'bg-red-50 text-red-700 border-red-200',
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
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-medium',
        config.classes,
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{customLabel || config.label}</span>
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  ColorBadge — variant-based badge (emerald / amber / red / muted)  */
/* ------------------------------------------------------------------ */

const VARIANT_CONFIG: Record<string, { icon: LucideIcon; classes: string }> = {
  emerald: { icon: CircleCheck, classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  amber: { icon: Clock4, classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  red: { icon: CircleX, classes: 'bg-red-50 text-red-700 border-red-200' },
  muted: { icon: CircleCheck, classes: 'bg-muted text-muted-foreground border-border' },
};

interface ColorBadgeProps {
  variant: 'emerald' | 'amber' | 'red' | 'muted';
  label: string;
  className?: string;
}

export const ColorBadge = ({ variant, label, className }: ColorBadgeProps) => {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-medium',
        config.classes,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </span>
  );
};
