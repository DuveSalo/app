import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { SkeletonForm } from '@/components/common/SkeletonLoader';
import { DataTable } from '@/components/common/DataTable';
import { ColorBadge } from '@/components/common/StatusBadge';
import { SubscriptionStatusBadge } from './components/SubscriptionStatusBadge';
import { formatDateLocal, formatCurrency } from '@/lib/utils/dateUtils';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
import { ROUTE_PATHS } from '@/constants/index';
import { AdminDocumentSection } from './components/AdminDocumentSection';
import type { AdminSchoolDetail, AdminPaymentRow, AdminDocumentModule } from './types';

const paymentColumns: ColumnDef<AdminPaymentRow, unknown>[] = [
  {
    accessorKey: 'amount',
    header: 'Monto',
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: 'periodStart',
    header: 'Período',
    cell: ({ row }) =>
      row.original.periodEnd
        ? `${formatDateLocal(row.original.periodStart)} – ${formatDateLocal(row.original.periodEnd)}`
        : formatDateLocal(row.original.periodStart),
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
];

const paymentStatusConfig: Record<string, { variant: 'emerald' | 'amber' | 'red' | 'muted'; label: string }> = {
  pending: { variant: 'amber', label: 'Pendiente' },
  approved: { variant: 'emerald', label: 'Aprobado' },
  rejected: { variant: 'red', label: 'Rechazado' },
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const config = paymentStatusConfig[status] || { variant: 'muted' as const, label: status };
  return <ColorBadge variant={config.variant} label={config.label} />;
};

const InfoItem = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-sm text-foreground">{value || '-'}</p>
  </div>
);

const AdminSchoolDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [school, setSchool] = useState<AdminSchoolDetail | null>(null);
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({});
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [schoolData, counts, paymentHistory] = await Promise.all([
          api.getSchoolDetail(id),
          api.getSchoolDocumentCounts(id),
          api.getSchoolPaymentHistory(id),
        ]);
        setSchool(schoolData);
        setDocumentCounts(counts);
        setPayments(paymentHistory);
      } catch {
        toast.error('Error al cargar los datos de la escuela');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <PageLayout title="Cargando...">
        <SkeletonForm />
      </PageLayout>
    );
  }

  if (!school) {
    return (
      <PageLayout title="Escuela no encontrada">
        <div className="text-sm text-muted-foreground">
          No se encontró la escuela solicitada.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={school.name}
      headerActions={
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTE_PATHS.ADMIN_SCHOOLS)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      }
    >
      <div className="space-y-0">
        {/* Company Info Section */}
        <section>
          <h2 className="text-base font-medium mb-4">Información de la escuela</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem label="Nombre" value={school.name} />
            <InfoItem label="CUIT" value={school.cuit} />
            <InfoItem label="Dirección" value={school.address} />
            <InfoItem label="Ciudad" value={school.city} />
            <InfoItem label="Provincia" value={school.province} />
            <InfoItem label="Localidad" value={school.locality} />
            <InfoItem label="Código postal" value={school.postalCode} />
            <InfoItem label="Teléfono" value={school.phone} />
            <InfoItem label="Email" value={school.email} />
          </div>
        </section>

        {/* Subscription Section */}
        <section className="border-t border-border pt-6 mt-6">
          <h2 className="text-base font-medium mb-4">Suscripción</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem label="Plan" value={school.plan} />
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <div className="mt-0.5">
                <SubscriptionStatusBadge status={school.subscriptionStatus} />
              </div>
            </div>
            <InfoItem
              label="Método de pago"
              value={school.paymentMethod === 'bank_transfer' ? 'Transferencia bancaria' : 'MercadoPago'}
            />
            <InfoItem
              label="Fecha de renovación"
              value={formatDateLocal(school.subscriptionRenewalDate)}
            />
            <InfoItem
              label="Fin del período de prueba"
              value={formatDateLocal(school.trialEndsAt)}
            />
          </div>
        </section>

        {/* Employees Section */}
        <section className="border-t border-border pt-6 mt-6">
          <h2 className="text-base font-medium mb-4">Empleados</h2>
          {school.employees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay empleados registrados</p>
          ) : (
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                      Nombre
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                      Email
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                      Rol
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {school.employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-muted/50">
                      <td className="text-sm py-3.5 px-4">{employee.name}</td>
                      <td className="text-sm py-3.5 px-4">{employee.email}</td>
                      <td className="text-sm py-3.5 px-4 capitalize">{employee.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Documents Section */}
        <section className="border-t border-border pt-6 mt-6">
          <h2 className="text-base font-medium mb-4">Documentos</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(documentCounts).map(([moduleKey, count]) => (
              <AdminDocumentSection
                key={moduleKey}
                module={moduleKey as AdminDocumentModule}
                count={count}
                companyId={school.id}
              />
            ))}
          </div>
        </section>

        {/* Payment History Section */}
        <section className="border-t border-border pt-6 mt-6">
          <h2 className="text-base font-medium mb-4">Historial de pagos</h2>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin historial de pagos</p>
          ) : (
            <DataTable columns={paymentColumns} data={payments} pageSize={5} />
          )}
        </section>
      </div>
    </PageLayout>
  );
};

export default AdminSchoolDetailPage;
