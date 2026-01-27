import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const itemVariants = cva(
  'flex items-center gap-3 rounded-lg transition-colors duration-150',
  {
    variants: {
      variant: {
        default: 'bg-white border border-gray-200 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        filled: 'bg-gray-50 hover:bg-gray-100',
      },
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-5',
      },
      interactive: {
        true: 'cursor-pointer active:scale-[0.99]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
    },
  }
);

export interface ItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemVariants> {
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  showArrow?: boolean;
}

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  (
    {
      icon: Icon,
      iconClassName,
      title,
      description,
      meta,
      action,
      showArrow,
      variant,
      size,
      interactive,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const isInteractive = interactive ?? !!onClick;

    return (
      <div
        ref={ref}
        className={cn(itemVariants({ variant, size, interactive: isInteractive }), className)}
        onClick={onClick}
        {...props}
      >
        {Icon && (
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100',
            iconClassName
          )}>
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          {description && (
            <p className="text-sm text-gray-500 truncate">{description}</p>
          )}
        </div>

        {meta && (
          <div className="shrink-0 text-sm text-gray-500">
            {meta}
          </div>
        )}

        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}

        {showArrow && isInteractive && (
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
        )}
      </div>
    );
  }
);

Item.displayName = 'Item';

// Item List wrapper
interface ItemListProps {
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
}

export const ItemList: React.FC<ItemListProps> = ({
  children,
  className,
  divided = false,
}) => {
  return (
    <div className={cn(
      'space-y-2',
      divided && 'space-y-0 divide-y divide-gray-200',
      className
    )}>
      {children}
    </div>
  );
};

// Selectable Item variant
interface SelectableItemProps extends Omit<ItemProps, 'action'> {
  selected?: boolean;
  onSelect?: () => void;
}

export const SelectableItem: React.FC<SelectableItemProps> = ({
  selected,
  onSelect,
  className,
  ...props
}) => {
  return (
    <Item
      {...props}
      onClick={onSelect}
      className={cn(
        selected && 'ring-2 ring-gray-900 ring-offset-2',
        className
      )}
      action={
        selected ? (
          <div className="h-5 w-5 rounded-full bg-gray-900 flex items-center justify-center">
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
        )
      }
    />
  );
};
