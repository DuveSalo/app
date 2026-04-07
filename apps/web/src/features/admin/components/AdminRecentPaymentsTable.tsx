import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/common/DataTable';
import { ColorBadge } from '@/components/common/StatusBadge';
import { formatDateLocal, formatCurrency } from '@/lib/utils/dateUtils';
import type { AdminPaymentRow } from '../types';
import { PaymentMethodBadge } from './PaymentMethodBadge';

// --- Payment Status Badge ---

const paymentStatusConfig: Record<
  string,
  { variant: 'emerald' | 'amber' | 'red' | 'muted'; label: string }
> = {
  pending: { variant: 'amber', label: 'Pendiente' },
  approved: { variant: 'emerald', label: 'Aprobado' },
  rejected: { variant: 'red', label: 'Rechazado' },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const config = paymentStatusConfig[status] || { variant: 'muted' as const, label: status };
  return <ColorBadge variant={config.variant} label={config.label} />;
}

interface AdminRecentPaymentsTableProps {
  payments: AdminPaymentRow[];
  onViewDetails: (payment: AdminPaymentRow) => void;
  onViewReceipt: (payment: AdminPaymentRow) => void;
}

export function AdminRecentPaymentsTable({
  payments,
  onViewDetails,
  onViewReceipt,
}: AdminRecentPaymentsTableProps) {
  const saleColumns: ColumnDef<AdminPaymentRow, string>[] = [
    {
      accessorKey: 'companyName',
      header: 'Escuela',
      cell: ({ row }) => <span className="font-medium">{row.original.companyName}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Monto',
      cell: ({ row }) => formatCurrency(row.original.amount),
      meta: { hideOnMobile: true },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Método',
      cell: ({ row }) => (
        <PaymentMethodBadge
          method={row.original.paymentMethod}
          cardBrand={row.original.cardBrand}
          cardLastFour={row.original.cardLastFour}
        />
      ),
      meta: { hideOnMobile: true },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha',
      cell: ({ row }) => formatDateLocal(row.original.createdAt),
      meta: { hideOnMobile: true },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const payment = row.original;
        const isBankTransfer = payment.paymentMethod === 'bank_transfer';

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(payment)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                {isBankTransfer && payment.receiptUrl && (
                  <DropdownMenuItem onClick={() => onViewReceipt(payment)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver comprobante
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <section>
      <h2 className="text-base font-medium mb-3">Ventas recientes</h2>
      <DataTable
        columns={saleColumns}
        data={payments}
        searchKey="companyName"
        searchPlaceholder="Buscar..."
        pageSize={5}
        cardOnly
        cardRenderer={(row) => {
          const isBankTransfer = row.paymentMethod === 'bank_transfer';
          return (
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between">
                <span className="font-medium">{row.companyName}</span>
                <PaymentMethodBadge
                  method={row.paymentMethod}
                  cardBrand={row.cardBrand}
                  cardLastFour={row.cardLastFour}
                />
              </div>
              <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                {formatCurrency(row.amount)} · <PaymentStatusBadge status={row.status} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {formatDateLocal(row.createdAt)}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(row)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    {isBankTransfer && row.receiptUrl && (
                      <DropdownMenuItem onClick={() => onViewReceipt(row)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver comprobante
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        }}
      />
    </section>
  );
}
