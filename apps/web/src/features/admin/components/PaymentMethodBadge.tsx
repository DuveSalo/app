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
  cardBrand?: string | null;
  cardLastFour?: string | null;
  className?: string;
}

export const PaymentMethodBadge = ({
  method,
  cardBrand,
  cardLastFour,
  className,
}: PaymentMethodBadgeProps) => {
  const config = METHOD_CONFIG[method];
  const Icon = config.icon;

  const cardDetail =
    method !== 'bank_transfer' && cardBrand
      ? ` · ${cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1)}${cardLastFour ? ` •••• ${cardLastFour}` : ''}`
      : '';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-xs font-medium',
        config.classes,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>
        {config.label}
        {cardDetail}
      </span>
    </span>
  );
};
