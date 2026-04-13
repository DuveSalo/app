import { CircleCheck, Clock4, CircleX, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ExpirationStatus } from '@/types/expirable';

type FilterTone = 'neutral' | ExpirationStatus;

const FILTER_TONE_CLASSES: Record<FilterTone, string> = {
  neutral: 'border-border bg-background text-foreground',
  valid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  expiring: 'border-amber-200 bg-amber-50 text-amber-700',
  expired: 'border-red-200 bg-red-50 text-red-700',
};

const STATUS_META: Record<
  ExpirationStatus,
  {
    icon: LucideIcon;
    label: string;
  }
> = {
  valid: {
    icon: CircleCheck,
    label: 'Vigente',
  },
  expiring: {
    icon: Clock4,
    label: 'Por vencer',
  },
  expired: {
    icon: CircleX,
    label: 'Vencido',
  },
};

export const activeFilterButtonClasses =
  'border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10';

export function isExpirationStatus(value: string | undefined): value is ExpirationStatus {
  return value === 'valid' || value === 'expiring' || value === 'expired';
}

interface FilterCountBadgeProps {
  count: number;
  className?: string;
}

export function FilterCountBadge({ count, className }: FilterCountBadgeProps) {
  const label = `${count} filtro${count === 1 ? '' : 's'}`;

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-lg border-dashed px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
        className
      )}
    >
      {label}
    </Badge>
  );
}

interface FilterOptionChipProps {
  label: string;
  icon?: LucideIcon;
  tone?: FilterTone;
  className?: string;
}

export function FilterOptionChip({
  label,
  icon: Icon,
  tone = 'neutral',
  className,
}: FilterOptionChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium',
        FILTER_TONE_CLASSES[tone],
        className
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      <span>{label}</span>
    </span>
  );
}

interface StatusOptionChipProps {
  status: ExpirationStatus;
  label?: string;
  className?: string;
}

export function StatusOptionChip({ status, label, className }: StatusOptionChipProps) {
  const meta = STATUS_META[status];

  return (
    <FilterOptionChip
      icon={meta.icon}
      label={label ?? meta.label}
      tone={status}
      className={className}
    />
  );
}
