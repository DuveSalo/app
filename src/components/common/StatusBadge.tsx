
import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold',
  {
    variants: {
      status: {
        valid: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
        expiring: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
        expired: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
      },
    },
  }
);

const dotVariants = cva('h-1.5 w-1.5 rounded-full', {
  variants: {
    status: {
      valid: 'bg-emerald-500',
      expiring: 'bg-amber-500',
      expired: 'bg-red-500',
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


