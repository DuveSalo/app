
import React from 'react';

interface StatusBadgeProps {
  status: 'valid' | 'expiring' | 'expired';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    valid: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      dot: 'bg-green-500',
      label: 'Vigente',
    },
    expiring: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500',
      label: 'Próximo a Vencer',
    },
    expired: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      dot: 'bg-red-500',
      label: 'Vencido',
    },
  };

  const currentStatus = statusStyles[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.text}`}>
      <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${currentStatus.dot}`} fill="currentColor" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
      {currentStatus.label}
    </span>
  );
};

export default StatusBadge;
