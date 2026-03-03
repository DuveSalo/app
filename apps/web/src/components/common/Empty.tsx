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
import { Button } from '@/components/ui/button';

const emptyVariants = cva(
  'flex flex-col items-center justify-center text-center',
  {
    variants: {
      size: {
        sm: 'py-5 gap-2.5',
        md: 'py-8 gap-3',
        lg: 'py-12 gap-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const iconSizeMap: Record<string, string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
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
    variant?: 'default' | 'secondary' | 'outline';
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
      <div className="bg-neutral-100 p-3 rounded-md border border-neutral-200">
        <IconComponent className={cn(iconSize, 'text-neutral-400')} strokeWidth={1.5} />
      </div>

      <div className="space-y-0.5">
        <h3 className="text-sm font-medium text-neutral-900">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button
          variant={action.variant || 'default'}
          size="sm"
          onClick={action.onClick}
          className="mt-1"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export const EmptySearch = ({
  query,
  description,
  ...props
}: Omit<EmptyProps, 'icon' | 'title'> & { query?: string }) => (
  <Empty
    icon="search"
    title="Sin resultados"
    description={description || (query ? `No se encontraron resultados para "${query}"` : 'No se encontraron resultados para tu busqueda')}
    {...props}
  />
);

export const EmptyList = (props: Omit<EmptyProps, 'icon'>) => (
  <Empty icon="list" {...props} />
);

export const EmptyFolder = (props: Omit<EmptyProps, 'icon'>) => (
  <Empty icon="folder" {...props} />
);
