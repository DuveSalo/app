import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { formatDateLocal } from '@/lib/utils/dateUtils';
import type { AdminSchoolRow } from '../types';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';

const schoolColumns: ColumnDef<AdminSchoolRow, string>[] = [
  {
    accessorKey: 'name',
    header: 'Escuela',
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.email || '-'}</span>,
    meta: { hideOnMobile: true },
  },
  {
    accessorKey: 'city',
    header: 'Localidad',
    cell: ({ row }) => (
      <span>{[row.original.city, row.original.province].filter(Boolean).join(', ') || '-'}</span>
    ),
    meta: { hideOnMobile: true },
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    meta: { hideOnMobile: true },
  },
  {
    accessorKey: 'subscriptionStatus',
    header: 'Estado',
    cell: ({ row }) => <SubscriptionStatusBadge status={row.original.subscriptionStatus} />,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Registro
        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => formatDateLocal(row.original.createdAt),
    meta: { hideOnMobile: true },
  },
];

interface AdminRecentSchoolsTableProps {
  schools: AdminSchoolRow[];
}

export function AdminRecentSchoolsTable({ schools }: AdminRecentSchoolsTableProps) {
  return (
    <section>
      <h2 className="text-base font-medium mb-3">Escuelas recientes</h2>
      <DataTable
        columns={schoolColumns}
        data={schools}
        searchKey="name"
        searchPlaceholder="Buscar escuela..."
        pageSize={5}
        cardOnly
        cardRenderer={(row) => (
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between">
              <span className="font-medium">{row.name}</span>
              <SubscriptionStatusBadge status={row.subscriptionStatus} />
            </div>
            <div className="mt-1 text-sm text-muted-foreground truncate">{row.email || '—'}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm">
                {row.city || '—'} · {row.plan || '—'}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDateLocal(row.createdAt)}
              </span>
            </div>
          </div>
        )}
      />
    </section>
  );
}
