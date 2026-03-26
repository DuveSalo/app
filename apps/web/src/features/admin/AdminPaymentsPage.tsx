import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Eye, Check, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageLayout from '@/components/layout/PageLayout';
import { SkeletonTable } from '@/components/common/SkeletonLoader';
import { DataTable } from '@/components/common/DataTable';
import { ColorBadge } from '@/components/common/StatusBadge';
import { formatDateLocal, formatCurrency } from '@/lib/utils/dateUtils';
import { queryKeys } from '@/lib/queryKeys';
import { PaymentMethodBadge } from './components/PaymentMethodBadge';
import { PaymentDetailDialog } from './components/PaymentDetailDialog';
import { RejectPaymentDialog } from './components/RejectPaymentDialog';
import * as api from '@/lib/api/services';
import { createLogger } from '@/lib/utils/logger';
import type { AdminPaymentRow } from './types';

const logger = createLogger('AdminPaymentsPage');

// --- Payment Status Badge ---

const paymentStatusConfig: Record<string, { variant: 'emerald' | 'amber' | 'red' | 'muted'; label: string }> = {
  pending: { variant: 'amber', label: 'Pendiente' },
  approved: { variant: 'emerald', label: 'Aprobado' },
  rejected: { variant: 'red', label: 'Rechazado' },
};

function PaymentStatusBadge({ status }: { status: string }) {
  const config = paymentStatusConfig[status] || { variant: 'muted' as const, label: status };
  return <ColorBadge variant={config.variant} label={config.label} />;
}

// --- Status filter tabs ---

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'rejected', label: 'Rechazados' },
] as const;

// --- Page ---

const AdminPaymentsPage = () => {
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery<AdminPaymentRow[]>({
    queryKey: queryKeys.adminPayments(),
    queryFn: api.getAllPayments,
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; paymentId: string }>({
    open: false,
    paymentId: '',
  });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; payment: AdminPaymentRow | null }>({
    open: false,
    payment: null,
  });

  // Client-side status filtering
  const filteredPayments = useMemo(() => {
    if (statusFilter === 'all') return payments;
    return payments.filter((p) => p.status === statusFilter);
  }, [payments, statusFilter]);

  const handleApprove = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      await api.approvePayment(paymentId);
      toast.success('Pago aprobado');
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPayments() });
    } catch (err) {
      logger.error('Error approving payment', err);
      toast.error('Error al aprobar el pago');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reason: string) => {
    const { paymentId } = rejectDialog;
    setRejectDialog({ open: false, paymentId: '' });
    setActionLoading(paymentId);
    try {
      await api.rejectPayment(paymentId, reason);
      toast.success('Pago rechazado');
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPayments() });
    } catch (err) {
      logger.error('Error rejecting payment', err);
      toast.error('Error al rechazar el pago');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewReceipt = async (payment: AdminPaymentRow) => {
    if (!payment.receiptUrl) {
      toast.error('Este pago no tiene comprobante adjunto');
      return;
    }
    const win = window.open('', '_blank');
    try {
      const signedUrl = await api.getReceiptSignedUrl(payment.receiptUrl);
      if (win) win.location.href = signedUrl;
    } catch (err) {
      win?.close();
      logger.error('Error getting receipt URL', err);
      toast.error('Error al abrir el comprobante');
    }
  };

  // --- Columns ---

  const columns: ColumnDef<AdminPaymentRow, string>[] = useMemo(
    () => [
      {
        accessorKey: 'companyName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Escuela
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.companyName}</span>
        ),
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Monto
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => formatCurrency(row.original.amount),
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Método',
        cell: ({ row }) => <PaymentMethodBadge method={row.original.paymentMethod} />,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Estado
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
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
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const payment = row.original;
          const loading = actionLoading === payment.id;
          const isPending = payment.status === 'pending';
          const isBankTransfer = payment.paymentMethod === 'bank_transfer';

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
                  <DropdownMenuItem
                    onClick={() => setDetailDialog({ open: true, payment })}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ver detalles
                  </DropdownMenuItem>
                  {isBankTransfer && payment.receiptUrl && (
                    <DropdownMenuItem onClick={() => handleViewReceipt(payment)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver comprobante
                    </DropdownMenuItem>
                  )}
                  {isPending && isBankTransfer && (
                    <>
                      <DropdownMenuItem onClick={() => handleApprove(payment.id)}>
                        <Check className="mr-2 h-4 w-4 text-emerald-600" />
                        Aprobar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setRejectDialog({ open: true, paymentId: payment.id })}
                      >
                        <X className="mr-2 h-4 w-4 text-destructive" />
                        Rechazar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [actionLoading]
  );

  // --- Status filter toolbar ---

  const toolbar = (
    <Tabs value={statusFilter} onValueChange={setStatusFilter}>
      <TabsList>
        {STATUS_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );

  if (isLoading) {
    return (
      <PageLayout title="Pagos">
        <SkeletonTable rows={8} />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Pagos">
      <DataTable
        columns={columns}
        data={filteredPayments}
        searchKey="companyName"
        searchPlaceholder="Buscar escuela..."
        toolbar={toolbar}
        pageSize={10}
      />

      <RejectPaymentDialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, paymentId: '' })}
        onConfirm={handleReject}
      />

      <PaymentDetailDialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, payment: null })}
        payment={detailDialog.payment}
        onViewReceipt={handleViewReceipt}
      />
    </PageLayout>
  );
};

export default AdminPaymentsPage;
