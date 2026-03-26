import { CreditCard, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const METHOD_CONFIG = {
  bank_transfer: {
    icon: Building2,
    label: 'Transferencia bancaria',
    classes: 'bg-muted text-muted-foreground border-border',
  },
  credit_card: {
    icon: CreditCard,
    label: 'Tarjeta de crédito',
    classes: 'bg-muted text-muted-foreground border-border',
  },
  debit_card: {
    icon: CreditCard,
    label: 'Tarjeta de débito',
    classes: 'bg-muted text-muted-foreground border-border',
  },
  card: {
    icon: CreditCard,
    label: 'Tarjeta de crédito',
    classes: 'bg-muted text-muted-foreground border-border',
  },
} as const;

type PaymentMethod = keyof typeof METHOD_CONFIG;

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  className?: string;
}

export const PaymentMethodBadge = ({ method, className }: PaymentMethodBadgeProps) => {
  const config = METHOD_CONFIG[method];
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
      <span>{config.label}</span>
    </span>
  );
};
