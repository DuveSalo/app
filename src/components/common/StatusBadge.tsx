
import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium tracking-wide',
  {
    variants: {
      status: {
        valid: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-500/15',
        expiring: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-500/15',
        expired: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-500/15',
      },
    },
  }
);

const dotVariants = cva('h-1.5 w-1.5 rounded-full animate-pulse-soft', {
  variants: {
    status: {
      valid: 'bg-emerald-500',
      expiring: 'bg-amber-500',
      expired: 'bg-rose-500',
    },
  },
});

const statusLabels = {
  valid: 'Vigente',
  expiring: 'Por vencer',
  expired: 'Vencido',
};

interface StatusBadgeProps {
  status: 'valid' | 'expiring' | 'expired';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={clsx(badgeVariants({ status }))}>
      <span className={clsx(dotVariants({ status }))} />
      {statusLabels[status]}
    </span>
  );
};


