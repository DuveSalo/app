import { type ReactNode } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { formatDateLocal } from '@/lib/utils/dateUtils';

export type StatCardVariant = 'total' | 'valid' | 'expiring' | 'expired';

export type HoverItem = {
  name: string;
  expirationDate: string;
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  changeText: string;
  variant: StatCardVariant;
  hoverItems?: HoverItem[];
}

const variantStyles: Record<StatCardVariant, string> = {
  total: 'border-border bg-background',
  valid: 'border-emerald-200 bg-emerald-50',
  expiring: 'border-amber-200 bg-amber-50',
  expired: 'border-red-200 bg-red-50',
};

const MAX_HOVER_ITEMS = 5;

const CardBody = ({
  label,
  value,
  icon,
  changeText,
  variant,
  hoverable,
}: Omit<StatCardProps, 'hoverItems'> & { hoverable: boolean }) => (
  <div
    className={`rounded-lg border p-5 ${variantStyles[variant]}${hoverable ? ' cursor-pointer' : ''}`}
  >
    <span className="text-sm text-muted-foreground block">{label}</span>
    <span className="text-2xl font-bold text-foreground block mt-1">{value}</span>
    <div className="flex items-center gap-1.5 mt-2">
      {icon}
      <span className="text-xs text-muted-foreground">{changeText}</span>
    </div>
  </div>
);

export const StatCard = ({ label, value, icon, changeText, variant, hoverItems }: StatCardProps) => {
  const hasItems = hoverItems !== undefined && hoverItems.length > 0;

  if (!hasItems) {
    return (
      <CardBody
        label={label}
        value={value}
        icon={icon}
        changeText={changeText}
        variant={variant}
        hoverable={false}
      />
    );
  }

  const visibleItems = hoverItems.slice(0, MAX_HOVER_ITEMS);
  const overflow = hoverItems.length - MAX_HOVER_ITEMS;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div>
          <CardBody
            label={label}
            value={value}
            icon={icon}
            changeText={changeText}
            variant={variant}
            hoverable={true}
          />
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" align="start" className="w-72 p-3">
        <ul className="flex flex-col">
          {visibleItems.map((item, idx) => (
            <li
              key={`${item.name}-${idx}`}
              className={`flex items-center justify-between py-1.5 text-sm${idx > 0 ? ' border-t border-border' : ''}`}
            >
              <span className="truncate mr-2 text-foreground">{item.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDateLocal(item.expirationDate)}
              </span>
            </li>
          ))}
          {overflow > 0 ? (
            <li className="border-t border-border pt-1.5 text-xs text-muted-foreground">
              +{overflow} más
            </li>
          ) : null}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
};
