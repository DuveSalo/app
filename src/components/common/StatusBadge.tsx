
import React from 'react';
import { cva } from 'cva';
import { clsx } from 'clsx';

const badgeVariants = cva('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', {
  variants: {
    status: {
      valid: 'bg-green-100 text-green-800',
      expiring: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
    },
  },
});

const dotVariants = cva('-ml-0.5 mr-1.5 h-2 w-2', {
  variants: {
    status: {
      valid: 'bg-green-500',
      expiring: 'bg-yellow-500',
      expired: 'bg-red-500',
    },
  },
});

const statusLabels = {
  valid: 'Vigente',
  expiring: 'Próximo a Vencer',
  expired: 'Vencido',
};

interface StatusBadgeProps {
  status: 'valid' | 'expiring' | 'expired';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={clsx(badgeVariants({ status }))}>
      <svg className={clsx(dotVariants({ status }))} fill="currentColor" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
      {statusLabels[status]}
    </span>
  );
};


