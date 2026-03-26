import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Clock,
  XCircle,
  DollarSign,
  Check,
  X,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  FileText,
} from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageLayout from '@/components/layout/PageLayout';
import { SkeletonCards, SkeletonTable } from '@/components/common/SkeletonLoader';
import { ColorBadge } from '@/components/common/StatusBadge';
import { DataTable } from '@/components/common/DataTable';
import { StatCard } from '../dashboard/components';
import { formatDateLocal, formatCurrency } from '@/lib/utils/dateUtils';
import { queryKeys } from '@/lib/queryKeys';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
import { createLogger } from '@/lib/utils/logger';
import type {
  AdminStats,
  AdminSchoolRow,
  AdminPaymentRow,
} from './types';
import { RejectPaymentDialog } from './components/RejectPaymentDialog';
import { SubscriptionStatusBadge } from './components/SubscriptionStatusBadge';
import { PaymentMethodBadge } from './components/PaymentMethodBadge';
import { PaymentDetailDialog } from './components/PaymentDetailDialog';

const logger = createLogger('AdminDashboardPage');

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

// --- Columns ---

const schoolColumns: ColumnDef<AdminSchoolRow, string>[] = [
  {
    accessorKey: 'name',
    header: 'Escuela',
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email || '-'}</span>
    ),
  },
  {
    accessorKey: 'city',
    header: 'Localidad',
    cell: ({ row }) => (
      <span>
        {[row.original.city, row.original.province].filter(Boolean).join(', ') || '-'}
      </span>
    ),
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
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
  },
];

// --- Page ---

const AdminDashboardPage = () => {
  const queryClient = useQueryClient();

  const { data: stats = null, isLoading: loadingStats } = useQuery<AdminStats | null>({
    queryKey: queryKeys.adminStats(),
    queryFn: api.getAdminStats,
  });
  const { data: schools = [], isLoading: loadingSchools } = useQuery<AdminSchoolRow[]>({
    queryKey: queryKeys.adminRecentSchools(10),
    queryFn: () => api.getRecentRegistrations(10),
  });
  const { data: pendingPayments = [], isLoading: loadingPending } = useQuery<AdminPaymentRow[]>({
    queryKey: queryKeys.adminPendingPayments(),
    queryFn: api.getPendingPayments,
  });
  const { data: recentPayments = [], isLoading: loadingSales } = useQuery<AdminPaymentRow[]>({
    queryKey: queryKeys.adminRecentSales(10),
    queryFn: () => api.getRecentSales(10),
  });
  const isLoading = loadingStats || loadingSchools || loadingPending || loadingSales;

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; paymentId: string }>({
    open: false,
    paymentId: '',
  });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; payment: AdminPaymentRow | null }>({
    open: false,
    payment: null,
  });

  const handleApprove = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      await api.approvePayment(paymentId);
      toast.success('Pago aprobado');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.adminPendingPayments() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminRecentSales(10) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminStats() }),
      ]);
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.adminPendingPayments() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminRecentSales(10) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminStats() }),
      ]);
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

  const pendingColumns: ColumnDef<AdminPaymentRow, string>[] = [
    {
      accessorKey: 'companyName',
      header: 'Escuela',
      cell: ({ row }) => <span className="font-medium">{row.original.companyName}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Monto',
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'periodStart',
      header: 'Período',
      cell: ({ row }) =>
        `${formatDateLocal(row.original.periodStart)} – ${formatDateLocal(row.original.periodEnd)}`,
    },
    {
      accessorKey: 'createdAt',
      header: 'Enviado',
      cell: ({ row }) => formatDateLocal(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const loading = actionLoading === row.original.id;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={loading}
              onClick={() => handleApprove(row.original.id)}
              title="Aprobar"
            >
              <Check className="h-4 w-4 text-emerald-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={loading}
              onClick={() => setRejectDialog({ open: true, paymentId: row.original.id })}
              title="Rechazar"
            >
              <X className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

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
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Método',
      cell: ({ row }) => <PaymentMethodBadge method={row.original.paymentMethod} />,
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <PageLayout title="Dashboard">
        <div className="flex flex-col gap-6">
          <SkeletonCards />
          <SkeletonTable rows={5} />
          <SkeletonTable rows={3} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Dashboard">
      <div className="flex flex-col gap-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Escuelas activas"
            value={stats?.activeSchools ?? 0}
            icon={<Building2 className="h-3.5 w-3.5 text-emerald-600" />}
            changeText="Suscripciones vigentes"
            variant="valid"
          />
          <StatCard
            label="Pagos pendientes"
            value={stats?.pendingPayments ?? 0}
            icon={<Clock className="h-3.5 w-3.5 text-amber-600" />}
            changeText="Transferencias por revisar"
            variant="expiring"
          />
          <StatCard
            label="Rechazados este mes"
            value={stats?.rejectedPayments ?? 0}
            icon={<XCircle className="h-3.5 w-3.5 text-destructive" />}
            changeText="Pagos rechazados"
            variant="expired"
          />
          <StatCard
            label="Ingresos del mes"
            value={formatCurrency(stats?.monthlyRevenue ?? 0)}
            icon={<DollarSign className="h-3.5 w-3.5 text-emerald-600" />}
            changeText="Total facturado"
            variant="total"
          />
        </div>

        {/* Pending Bank Transfers */}
        {pendingPayments.length > 0 && (
          <section>
            <h2 className="text-base font-medium mb-3">Pagos pendientes de aprobación</h2>
            <DataTable
              columns={pendingColumns}
              data={pendingPayments}
              searchKey="companyName"
              searchPlaceholder="Buscar escuela..."
              pageSize={5}
            />
          </section>
        )}

        {/* Recent Registrations */}
        <section>
          <h2 className="text-base font-medium mb-3">Registros recientes</h2>
          <DataTable
            columns={schoolColumns}
            data={schools}
            searchKey="name"
            searchPlaceholder="Buscar escuela..."
            pageSize={5}
          />
        </section>

        {/* Recent Sales */}
        {recentPayments.length > 0 && (
          <section>
            <h2 className="text-base font-medium mb-3">Ventas recientes</h2>
            <DataTable
              columns={saleColumns}
              data={recentPayments}
              searchKey="companyName"
              searchPlaceholder="Buscar..."
              pageSize={5}
            />
          </section>
        )}
      </div>

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

export default AdminDashboardPage;
