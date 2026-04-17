import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Clock, XCircle, DollarSign } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { SkeletonCards, SkeletonTable } from '@/components/common/SkeletonLoader';
import { StatCard } from '../dashboard/components';
import { formatCurrency } from '@/lib/utils/dateUtils';
import { queryKeys } from '@/lib/queryKeys';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
import { createLogger } from '@/lib/utils/logger';
import type { AdminStats, AdminSchoolRow, AdminPaymentRow } from './types';
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
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRecentSchools(10) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats() }),
    ]);

  const handleApprove = async (paymentId: string) => {
    setDetailDialog({ open: false, payment: null });
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

  const handleReject = async (paymentId: string, reason: string) => {
    setDetailDialog({ open: false, payment: null });
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

        {/* Recent Registrations — pending schools show "Revisar pago" button */}
        <AdminRecentSchoolsTable
          schools={schools}
          pendingPayments={pendingPayments}
          onViewPayment={(payment) => setDetailDialog({ open: true, payment })}
        />

        {/* Recent Sales */}
        {recentPayments.length > 0 && (
          <AdminRecentPaymentsTable
            payments={recentPayments}
            onViewDetails={(payment) => setDetailDialog({ open: true, payment })}
            onViewReceipt={handleViewReceipt}
          />
        )}
      </div>

      <PaymentDetailDialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, payment: null })}
        payment={detailDialog.payment}
        onViewReceipt={handleViewReceipt}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </PageLayout>
  );
};

export default AdminDashboardPage;
