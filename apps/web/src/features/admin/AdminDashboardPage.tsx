import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Clock,
  XCircle,
  DollarSign,
  Check,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { SkeletonCards, SkeletonTable } from '@/components/common/SkeletonLoader';
import { ColorBadge } from '@/components/common/StatusBadge';
import { DataTable } from '@/components/common/DataTable';
import { StatCard } from '../dashboard/components';
import { formatDateLocal, formatCurrency } from '@/lib/utils/dateUtils';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
import { createLogger } from '@/lib/utils/logger';
import type {
  AdminStats,
  AdminSchoolRow,
  AdminPaymentRow,
  AdminSaleRow,
} from './types';
import { RejectPaymentDialog } from './components/RejectPaymentDialog';
import { SubscriptionStatusBadge } from './components/SubscriptionStatusBadge';

const logger = createLogger('AdminDashboardPage');

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

const saleColumns: ColumnDef<AdminSaleRow, string>[] = [
  {
    accessorKey: 'companyName',
    header: 'Escuela',
    cell: ({ row }) => <span className="font-medium">{row.original.companyName}</span>,
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
  },
  {
    accessorKey: 'amount',
    header: 'Monto',
    cell: ({ row }) => formatCurrency(row.original.amount / 100),
  },
  {
    accessorKey: 'status',
    header: 'Método',
    cell: ({ row }) => (
      <ColorBadge variant="muted" label={row.original.status} />
    ),
  },
  {
    accessorKey: 'date',
    header: 'Fecha',
    cell: ({ row }) => formatDateLocal(row.original.date),
  },
];

// --- Page ---

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [schools, setSchools] = useState<AdminSchoolRow[]>([]);
  const [pendingPayments, setPendingPayments] = useState<AdminPaymentRow[]>([]);
  const [sales, setSales] = useState<AdminSaleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; paymentId: string }>({
    open: false,
    paymentId: '',
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, schoolsData, paymentsData, salesData] = await Promise.all([
        api.getAdminStats(),
        api.getRecentRegistrations(10),
        api.getPendingPayments(),
        api.getRecentSales(10),
      ]);
      setStats(statsData);
      setSchools(schoolsData);
      setPendingPayments(paymentsData);
      setSales(salesData);
    } catch (err) {
      logger.error('Error fetching admin dashboard', err);
      toast.error('Error al cargar el dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      await api.approvePayment(paymentId);
      toast.success('Pago aprobado');
      await fetchData();
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
      await fetchData();
    } catch (err) {
      logger.error('Error rejecting payment', err);
      toast.error('Error al rechazar el pago');
    } finally {
      setActionLoading(null);
    }
  };

  const paymentColumns: ColumnDef<AdminPaymentRow, string>[] = [
    {
      accessorKey: 'companyName',
      header: 'Escuela',
      cell: ({ row }) => <span className="font-medium">{row.original.companyName}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Monto',
      cell: ({ row }) => formatCurrency(row.original.amount / 100),
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
            value={0}
            icon={<DollarSign className="h-3.5 w-3.5 text-emerald-600" />}
            changeText={formatCurrency((stats?.monthlyRevenue ?? 0) / 100)}
            variant="total"
          />
        </div>

        {/* Pending Bank Transfers */}
        {pendingPayments.length > 0 && (
          <section>
            <h2 className="text-base font-medium mb-3">Pagos pendientes de aprobación</h2>
            <DataTable
              columns={paymentColumns}
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
        {sales.length > 0 && (
          <section>
            <h2 className="text-base font-medium mb-3">Ventas recientes</h2>
            <DataTable
              columns={saleColumns}
              data={sales}
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
    </PageLayout>
  );
};

export default AdminDashboardPage;
