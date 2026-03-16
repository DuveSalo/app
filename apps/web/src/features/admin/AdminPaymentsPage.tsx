import { useState, useEffect, useCallback, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Eye, Check, X } from 'lucide-react';
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
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; paymentId: string }>({
    open: false,
    paymentId: '',
  });

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllPayments();
      setPayments(data);
    } catch (err) {
      logger.error('Error fetching payments', err);
      toast.error('Error al cargar los pagos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
      await fetchPayments();
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
      await fetchPayments();
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
    try {
      const signedUrl = await api.getReceiptSignedUrl(payment.receiptUrl);
      window.open(signedUrl, '_blank');
    } catch (err) {
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
        accessorKey: 'periodStart',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Periodo
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) =>
          `${formatDateLocal(row.original.periodStart)} - ${formatDateLocal(row.original.periodEnd)}`,
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
                    onClick={() => handleViewReceipt(payment)}
                    disabled={!payment.receiptUrl}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver comprobante
                  </DropdownMenuItem>
                  {isPending && (
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
    </PageLayout>
  );
};

export default AdminPaymentsPage;
