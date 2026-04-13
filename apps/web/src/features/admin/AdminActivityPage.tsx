import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageLayout from '@/components/layout/PageLayout';
import { SkeletonTable } from '@/components/common/SkeletonLoader';
import { DataTable } from '@/components/common/DataTable';
import { ColorBadge } from '@/components/common/StatusBadge';
import { formatDateLocal } from '@/lib/utils/dateUtils';
import * as api from '@/lib/api/services';
import { queryKeys } from '@/lib/queryKeys';
import type { ActivityLogRow } from './types';

// --- Action labels (Spanish) ---

const ACTION_LABELS: Record<string, string> = {
  approve_payment: 'Aprobar pago',
  reject_payment: 'Rechazar pago',
  suspend_school: 'Suspender escuela',
  activate_school: 'Activar escuela',
  delete_school: 'Eliminar escuela',
  update_plan: 'Actualizar plan',
  create_plan: 'Crear plan',
  delete_plan: 'Eliminar plan',
  toggle_plan: 'Cambiar estado plan',
  delete_account: 'Eliminar cuenta',
};

// --- Target type labels ---

const TARGET_TYPE_LABELS: Record<string, string> = {
  manual_payment: 'Pago',
  company: 'Escuela',
  subscription: 'Suscripción',
  subscription_plan: 'Plan',
  user: 'Usuario',
};

// --- Action badge colors ---

type ColorVariant = 'emerald' | 'amber' | 'red' | 'muted';

const ACTION_VARIANTS: Record<string, ColorVariant> = {
  approve_payment: 'emerald',
  activate_school: 'emerald',
  create_plan: 'emerald',
  reject_payment: 'red',
  suspend_school: 'red',
  delete_school: 'red',
  delete_plan: 'red',
  delete_account: 'red',
  update_plan: 'amber',
  toggle_plan: 'amber',
};

function ActionBadge({ action }: { action: string }) {
  const variant = ACTION_VARIANTS[action] || 'muted';
  const label = ACTION_LABELS[action] || action;
  return <ColorBadge variant={variant} label={label} />;
}

// --- Filter tabs ---

const FILTER_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'payments', label: 'Pagos' },
  { value: 'schools', label: 'Escuelas' },
  { value: 'plans', label: 'Planes' },
  { value: 'users', label: 'Usuarios' },
] as const;

const FILTER_ACTIONS: Record<string, string[]> = {
  payments: ['approve_payment', 'reject_payment'],
  schools: ['suspend_school', 'activate_school', 'delete_school'],
  plans: ['update_plan', 'create_plan', 'delete_plan', 'toggle_plan'],
  users: ['delete_account'],
};

// --- Metadata display helper ---

function formatMetadata(metadata: Record<string, unknown>): string {
  if (!metadata || Object.keys(metadata).length === 0) return '—';
  if (metadata.reason) return String(metadata.reason);
  if (metadata.user_email) return `Usuario: ${String(metadata.user_email)}`;
  if (metadata.company_id) return `Escuela: ${String(metadata.company_id).substring(0, 8)}...`;
  const entries = Object.entries(metadata)
    .slice(0, 2)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(', ');
  return entries || '—';
}

// --- Page ---

const AdminActivityPage = () => {
  const [filter, setFilter] = useState<string>('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: queryKeys.adminActivity(),
    queryFn: api.getActivityLogs,
  });

  const filteredLogs = useMemo(() => {
    if (filter === 'all') return logs;
    const actions = FILTER_ACTIONS[filter];
    if (!actions) return logs;
    return logs.filter((l) => actions.includes(l.action));
  }, [logs, filter]);

  // --- Columns ---

  const columns: ColumnDef<ActivityLogRow, string>[] = useMemo(
    () => [
      {
        accessorKey: 'action',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Acción
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => <ActionBadge action={row.original.action} />,
      },
      {
        accessorKey: 'targetType',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Tipo
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {TARGET_TYPE_LABELS[row.original.targetType] || row.original.targetType}
          </span>
        ),
        meta: { hideOnMobile: true },
      },
      {
        accessorKey: 'adminEmail',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Admin
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.adminEmail}</span>,
      },
      {
        accessorKey: 'metadata',
        header: 'Detalle',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
            {formatMetadata(row.original.metadata)}
          </span>
        ),
        enableSorting: false,
        meta: { hideOnMobile: true },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Fecha
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => formatDateLocal(row.original.createdAt),
        meta: { hideOnMobile: true },
      },
    ],
    []
  );

  // --- Filter toolbar ---

  const toolbar = (
    <div className="w-full">
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="sm:hidden">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FILTER_TABS.map((tab) => (
            <SelectItem key={tab.value} value={tab.value}>
              {tab.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Tabs value={filter} onValueChange={setFilter} className="hidden sm:block">
        <TabsList>
          {FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );

  if (isLoading) {
    return (
      <PageLayout title="Actividad" showNotifications={false}>
        <SkeletonTable rows={10} />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Actividad" showNotifications={false}>
      <DataTable
        columns={columns}
        data={filteredLogs}
        searchKey="adminEmail"
        searchPlaceholder="Buscar por admin..."
        toolbar={toolbar}
        pageSize={10}
        cardRenderer={(row) => (
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">
                <ActionBadge action={row.action} />
              </span>
              <span className="text-sm text-muted-foreground">
                {TARGET_TYPE_LABELS[row.targetType] || row.targetType || '—'}
              </span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{row.adminEmail}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {formatDateLocal(row.createdAt)}
            </div>
          </div>
        )}
      />
    </PageLayout>
  );
};

export default AdminActivityPage;
