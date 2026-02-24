import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  FileX,
  FolderOpen,
  Search,
  Inbox,
  ClipboardList,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

const emptyVariants = cva(
  'flex flex-col items-center justify-center text-center',
  {
    variants: {
      size: {
        sm: 'py-8 gap-3',
        md: 'py-12 gap-4',
        lg: 'py-16 gap-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const iconSizeMap: Record<string, string> = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const presetIcons: Record<string, LucideIcon> = {
  file: FileX,
  folder: FolderOpen,
  search: Search,
  inbox: Inbox,
  list: ClipboardList,
};

type EmptySize = 'sm' | 'md' | 'lg';

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon | keyof typeof presetIcons;
  title?: string;
  description?: string;
  size?: EmptySize;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
}

export const Empty = ({
  icon = 'inbox',
  title = 'No hay datos',
  description,
  action,
  size = 'md',
  className,
  ...props
}: EmptyProps) => {
  const IconComponent = typeof icon === 'string' ? presetIcons[icon] || Inbox : icon;
  const currentSize = (size ?? 'md') as EmptySize;
  const iconSize = iconSizeMap[currentSize];

  return (
    <div className={cn(emptyVariants({ size: currentSize }), className)} {...props}>
      <div className="rounded-full bg-gray-100 p-4">
        <IconComponent className={cn(iconSize, 'text-gray-400')} strokeWidth={1.5} />
      </div>

      <div className="space-y-1.5">
        <h3 className={cn(
          'font-medium text-gray-900',
          currentSize === 'sm' && 'text-sm',
          currentSize === 'md' && 'text-base',
          currentSize === 'lg' && 'text-lg'
        )}>
          {title}
        </h3>
        {description && (
          <p className={cn(
            'text-gray-500 max-w-sm mx-auto',
            currentSize === 'sm' && 'text-xs',
            currentSize === 'md' && 'text-sm',
            currentSize === 'lg' && 'text-base'
          )}>
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button
          variant={action.variant || 'primary'}
          size={currentSize}
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Preset empty states for common use cases
export const EmptySearch = ({
  query,
  description,
  ...props
}: Omit<EmptyProps, 'icon' | 'title'> & { query?: string }) => (
  <Empty
    icon="search"
    title="Sin resultados"
    description={description || (query ? `No se encontraron resultados para "${query}"` : 'No se encontraron resultados para tu búsqueda')}
    {...props}
  />
);

export const EmptyList = (props: Omit<EmptyProps, 'icon'>) => (
  <Empty icon="list" {...props} />
);

export const EmptyFolder = (props: Omit<EmptyProps, 'icon'>) => (
  <Empty icon="folder" {...props} />
);
