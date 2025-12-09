
import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const statusConfig = {
  valid: {
    label: 'Vigente',
    bgColor: '#dcfce7',
    textColor: '#15803d',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  expiring: {
    label: 'Por vencer',
    bgColor: '#fef3c7',
    textColor: '#b45309',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  expired: {
    label: 'Vencido',
    bgColor: '#fee2e2',
    textColor: '#dc2626',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

interface StatusBadgeProps {
  status: 'valid' | 'expiring' | 'expired';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bgColor, color: config.textColor }}
    >
      {config.icon}
      {config.label}
    </span>
  );
};
