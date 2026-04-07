import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Clock, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type ColumnDef } from '@tanstack/react-table';
import { QRDocumentType } from '../../types/index';
import { ROUTE_PATHS } from '../../constants/index';
import * as api from '@/lib/api/services';
import { useAuth } from '@/lib/auth/AuthContext';
import { queryKeys } from '@/lib/queryKeys';
import PageLayout from '../../components/layout/PageLayout';
import { SkeletonCards, SkeletonTable } from '../../components/common/SkeletonLoader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatusFilter, statusFilterFn } from '../../components/common/StatusFilter';
import { calculateExpirationStatus } from '../../lib/utils/dateUtils';
import { formatDateLocal } from '../../lib/utils/dateUtils';
import { StatCard } from './components';
import type { ExpirationStatus } from '../../types/expirable';

interface DashboardItem {
  id: string;
  name: string;
  type: string;
  expirationDate: string;
  status: ExpirationStatus;
  modulePath: string;
}

const statusOrder: Record<ExpirationStatus, number> = { expired: 1, expiring: 2, valid: 3 };

const columns: ColumnDef<DashboardItem, string>[] = [
  {
    accessorKey: 'name',
    header: 'Documento',
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    meta: { hideOnMobile: true },
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    filterFn: statusFilterFn,
  },
  {
    accessorKey: 'expirationDate',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Vencimiento
        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => formatDateLocal(row.original.expirationDate),
    meta: { hideOnMobile: true },
  },
];

const DashboardPage = () => {
  const { currentCompany } = useAuth();

  const { data: items = [], isLoading } = useQuery({
    queryKey: queryKeys.dashboard(currentCompany?.id ?? ''),
    enabled: !!currentCompany,
    queryFn: async () => {
      const allItems: DashboardItem[] = [];

      const [certsData, systemsData, qrDocs] = await Promise.all([
        api.getCertificates(currentCompany!.id),
        api.getSelfProtectionSystems(currentCompany!.id),
        api.getAllQRDocuments(currentCompany!.id),
      ]);

      const certs = certsData.map((c) => ({
        id: c.id,
        name: `Cert. ${c.intervener}`,
        type: 'Certificado',
        expirationDate: c.expirationDate,
        modulePath: ROUTE_PATHS.CONSERVATION_CERTIFICATES,
        status: calculateExpirationStatus(c.expirationDate),
      }));
      allItems.push(...certs);

      const systems = systemsData.map((s) => ({
        id: s.id,
        name: `SPA — ${s.registrationNumber || s.intervener || 'Sin matrícula'}`,
        type: 'Autoprotección',
        expirationDate: s.expirationDate,
        modulePath: ROUTE_PATHS.SELF_PROTECTION_SYSTEMS,
        status: calculateExpirationStatus(s.expirationDate),
      }));
      allItems.push(...systems);

      const qrItems = qrDocs.map((doc) => {
        const expiry = new Date(doc.uploadDate);
        expiry.setFullYear(expiry.getFullYear() + 1);
        const expirationDate = expiry.toISOString().split('T')[0];
        let linkPath = '';
        switch (doc.type) {
          case QRDocumentType.Elevators:
            linkPath = ROUTE_PATHS.QR_ELEVATORS;
            break;
          case QRDocumentType.WaterHeaters:
            linkPath = ROUTE_PATHS.QR_WATER_HEATERS;
            break;
          case QRDocumentType.FireSafetySystem:
            linkPath = ROUTE_PATHS.QR_FIRE_SAFETY;
            break;
          case QRDocumentType.DetectionSystem:
            linkPath = ROUTE_PATHS.QR_DETECTION;
            break;
          case QRDocumentType.ElectricalInstallations:
            linkPath = ROUTE_PATHS.ELECTRICAL_INSTALLATIONS;
            break;
        }

        return {
          id: doc.id,
          name: `Archivo: ${doc.type}`,
          type: doc.type,
          expirationDate,
          modulePath: linkPath,
          status: calculateExpirationStatus(expirationDate),
        };
      });
      allItems.push(...qrItems);

      return allItems.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    },
    enabled: !!currentCompany,
  });

  const stats = useMemo(() => {
    const counts = { total: items.length, valid: 0, expiring: 0, expired: 0 };
    for (const item of items) {
      if (item.status === 'valid') counts.valid++;
      else if (item.status === 'expiring') counts.expiring++;
      else if (item.status === 'expired') counts.expired++;
    }
    return counts;
  }, [items]);

  const moduleCount = useMemo(() => new Set(items.map((item) => item.type)).size, [items]);

  if (isLoading) {
    return (
      <PageLayout title="Inicio">
        <div className="flex flex-col gap-4">
          <SkeletonCards />
          <SkeletonTable />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Inicio">
      <div className="flex flex-col h-full gap-6 overflow-y-auto custom-scrollbar">
        {/* Stat cards */}
        <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total documentos"
            value={stats.total}
            icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-600" />}
            changeText={`${moduleCount} módulos`}
            variant="total"
          />
          <StatCard
            label="Vigentes"
            value={stats.valid}
            icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-600" />}
            changeText="+3 este mes"
            variant="valid"
          />
          <StatCard
            label="Por vencer"
            value={stats.expiring}
            icon={<Clock className="h-3.5 w-3.5 text-amber-600" />}
            changeText="Próximos 30d"
            variant="expiring"
          />
          <StatCard
            label="Vencidos"
            value={stats.expired}
            icon={<AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
            changeText="Requieren atención"
            variant="expired"
          />
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={items}
          searchKey="name"
          searchPlaceholder="Buscar documentos..."
          pageSize={5}
          toolbar={(table) => <StatusFilter column={table.getColumn('status')} />}
          cardRenderer={(row: DashboardItem) => (
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-sm leading-snug">{row.name}</span>
                <StatusBadge status={row.status} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{row.type}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateLocal(row.expirationDate)}
                </span>
              </div>
            </div>
          )}
        />
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
