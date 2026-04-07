import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Clock, XCircle, DollarSign, Check, X } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { SkeletonCards, SkeletonTable } from '@/components/common/SkeletonLoader';
import { DataTable } from '@/components/common/DataTable';
import { StatCard } from '../dashboard/components';
import { formatDateLocal, formatCurrency } from '@/lib/utils/dateUtils';
import { queryKeys } from '@/lib/queryKeys';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
import { createLogger } from '@/lib/utils/logger';
import type { AdminStats, AdminSchoolRow, AdminPaymentRow } from './types';
import { RejectPaymentDialog } from './components/RejectPaymentDialog';
import { PaymentDetailDialog } from './components/PaymentDetailDialog';
import { AdminRecentSchoolsTable } from './components/AdminRecentSchoolsTable';
import { AdminRecentPaymentsTable } from './components/AdminRecentPaymentsTable';

const logger = createLogger('AdminDashboardPage');

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
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    payment: AdminPaymentRow | null;
  }>({
    open: false,
    payment: null,
  });

  const invalidatePaymentQueries = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPendingPayments() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRecentSales(10) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats() }),
    ]);

  const handleApprove = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      await api.approvePayment(paymentId);
      toast.success('Pago aprobado');
      await invalidatePaymentQueries();
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
      await invalidatePaymentQueries();
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
      meta: { hideOnMobile: true },
    },
    {
      accessorKey: 'periodStart',
      header: 'Período',
      cell: ({ row }) =>
        `${formatDateLocal(row.original.periodStart)} – ${formatDateLocal(row.original.periodEnd)}`,
      meta: { hideOnMobile: true },
    },
    {
      accessorKey: 'createdAt',
      header: 'Enviado',
      cell: ({ row }) => formatDateLocal(row.original.createdAt),
      meta: { hideOnMobile: true },
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
              aria-label={`Aprobar pago de ${row.original.companyName}`}
            >
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="sr-only">Aprobar pago</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={loading}
              onClick={() => setRejectDialog({ open: true, paymentId: row.original.id })}
              title="Rechazar"
              aria-label={`Rechazar pago de ${row.original.companyName}`}
            >
              <X className="h-4 w-4 text-destructive" />
              <span className="sr-only">Rechazar pago</span>
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <PageLayout title="Dashboard" showNotifications={false}>
        <div className="flex flex-col gap-6">
          <SkeletonCards />
          <SkeletonTable rows={5} />
          <SkeletonTable rows={3} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Dashboard" showNotifications={false}>
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
              cardRenderer={(row) => {
                const loading = actionLoading === row.id;
                return (
                  <div className="border rounded-lg p-4 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{row.companyName}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleApprove(row.id)}
                          aria-label={`Aprobar pago de ${row.companyName}`}
                          className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent disabled:opacity-50"
                        >
                          <Check className="h-4 w-4 text-emerald-600" />
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setRejectDialog({ open: true, paymentId: row.id })}
                          aria-label={`Rechazar pago de ${row.companyName}`}
                          className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent disabled:opacity-50"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {formatCurrency(row.amount)} · {formatDateLocal(row.periodStart)} –{' '}
                      {formatDateLocal(row.periodEnd)}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Enviado: {formatDateLocal(row.createdAt)}
                    </div>
                  </div>
                );
              }}
            />
          </section>
        )}

        {/* Recent Registrations */}
        <AdminRecentSchoolsTable schools={schools} />

        {/* Recent Sales */}
        {recentPayments.length > 0 && (
          <AdminRecentPaymentsTable
            payments={recentPayments}
            onViewDetails={(payment) => setDetailDialog({ open: true, payment })}
            onViewReceipt={handleViewReceipt}
          />
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
