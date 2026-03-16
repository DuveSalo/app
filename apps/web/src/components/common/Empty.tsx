import { type HTMLAttributes } from 'react';
import {
  FileX,
  FolderOpen,
  Search,
  Inbox,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const presetIcons: Record<string, LucideIcon> = {
  file: FileX,
  folder: FolderOpen,
  search: Search,
  inbox: Inbox,
  list: ClipboardList,
};

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon | keyof typeof presetIcons;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'ghost' | 'destructive';
  };
}

export const Empty = ({
  icon = 'inbox',
  title = 'No hay datos',
  description,
  action,
  className,
  ...props
}: EmptyProps) => {
  const IconComponent = typeof icon === 'string' ? presetIcons[icon] || Inbox : icon;

  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 gap-4', className)} {...props}>
      <IconComponent className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.25} />

      <div className="space-y-1">
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
        )}
      </div>

      {action && (
        <Button variant={action.variant || 'default'} onClick={action.onClick}>
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
