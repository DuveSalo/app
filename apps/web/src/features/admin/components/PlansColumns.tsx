import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColorBadge } from '@/components/common/StatusBadge';
import { formatCurrency } from '@/lib/utils/dateUtils';
import type { SubscriptionPlanRow } from '../types';

function PlanStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <ColorBadge variant={isActive ? 'emerald' : 'muted'} label={isActive ? 'Activo' : 'Inactivo'} />
  );
}

interface PlansColumnActions {
  onEdit: (plan: SubscriptionPlanRow) => void;
  onToggle: (plan: SubscriptionPlanRow) => void;
  onDelete: (planId: string) => void;
  actionLoading: string | null;
}

export function getPlansColumns({
  onEdit,
  onToggle,
  onDelete,
  actionLoading,
}: PlansColumnActions): ColumnDef<SubscriptionPlanRow, unknown>[] {
  return [
    {
      accessorKey: 'key',
      header: 'Clave',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.key}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nombre
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Precio
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => formatCurrency(row.original.price / 100),
    },
    {
      accessorKey: 'features',
      header: 'Caracter\u00edsticas',
      cell: ({ row }) => {
        const features = row.original.features;
        const text = features.join(', ');
        return (
          <span className="text-sm text-muted-foreground truncate max-w-[300px] block" title={text}>
            {text || '\u2014'}
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Estado',
      cell: ({ row }) => <PlanStatusBadge isActive={row.original.isActive} />,
    },
    {
      accessorKey: 'sortOrder',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Orden
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => row.original.sortOrder,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const plan = row.original;
        const loading = actionLoading === plan.id;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={loading}>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(plan)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggle(plan)}>
                  <Power className="mr-2 h-4 w-4" />
                  {plan.isActive ? 'Desactivar' : 'Activar'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(plan.id)} variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
