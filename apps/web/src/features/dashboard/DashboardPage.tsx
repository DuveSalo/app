import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { QRDocumentType } from '../../types/index';
import { ROUTE_PATHS } from '../../constants/index';
import * as api from '@/lib/api/services';
import { useAuth } from '../auth/AuthContext';
import PageLayout from '../../components/layout/PageLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { calculateExpirationStatus } from '../../lib/utils/dateUtils';
import { createLogger } from '../../lib/utils/logger';
import {
  StatCard,
  DashboardFilters,
  DashboardTable,
  DashboardCards,
  Pagination,
  DashboardItem
} from './components';

const logger = createLogger('DashboardPage');

const SORT_OPTIONS = [
  { value: 'status-asc', label: 'Estado: Crítico primero' },
  { value: 'expiration-asc', label: 'Vencimiento: Más próximo' },
  { value: 'expiration-desc', label: 'Vencimiento: Más lejano' },
  { value: 'name-asc', label: 'Nombre: A-Z' },
  { value: 'name-desc', label: 'Nombre: Z-A' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'valid', label: 'Vigente' },
  { value: 'expiring', label: 'Próximo a vencer' },
  { value: 'expired', label: 'Vencido' },
];

const DashboardPage = () => {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('expiration-asc');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { currentCompany } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const fetchItems = async () => {
      if (!currentCompany) return;
      setIsLoading(true);

      try {
        const allItems: DashboardItem[] = [];

        const [certsData, systemsData, qrDocs] = await Promise.all([
          api.getCertificates(currentCompany.id),
          api.getSelfProtectionSystems(currentCompany.id),
          api.getAllQRDocuments(currentCompany.id)
        ]);

        if (ignore) return;

        const certs = certsData.map(c => ({
          id: c.id,
          name: `Cert. ${c.intervener}`,
          type: 'Certificado',
          expirationDate: c.expirationDate,
          modulePath: ROUTE_PATHS.CONSERVATION_CERTIFICATES,
          status: calculateExpirationStatus(c.expirationDate)
        }));
        allItems.push(...certs);

        const systems = systemsData.map(s => ({
          id: s.id,
          name: `SPA — ${s.registrationNumber || s.intervener || 'Sin matrícula'}`,
          type: 'Autoprotección',
          expirationDate: s.expirationDate,
          modulePath: ROUTE_PATHS.SELF_PROTECTION_SYSTEMS,
          status: calculateExpirationStatus(s.expirationDate)
        }));
        allItems.push(...systems);

        const qrItems = qrDocs.map(doc => {
          const expiry = new Date(doc.uploadDate);
          expiry.setFullYear(expiry.getFullYear() + 1);
          const expirationDate = expiry.toISOString().split('T')[0];
          let linkPath = '';
          switch (doc.type) {
            case QRDocumentType.Elevators: linkPath = ROUTE_PATHS.QR_ELEVATORS; break;
            case QRDocumentType.WaterHeaters: linkPath = ROUTE_PATHS.QR_WATER_HEATERS; break;
            case QRDocumentType.FireSafetySystem: linkPath = ROUTE_PATHS.QR_FIRE_SAFETY; break;
            case QRDocumentType.DetectionSystem: linkPath = ROUTE_PATHS.QR_DETECTION; break;
            case QRDocumentType.ElectricalInstallations: linkPath = ROUTE_PATHS.ELECTRICAL_INSTALLATIONS; break;
          }

          return {
            id: doc.id,
            name: `Archivo: ${doc.type}`,
            type: doc.type,
            expirationDate: expirationDate,
            modulePath: linkPath,
            status: calculateExpirationStatus(expirationDate)
          };
        });
        allItems.push(...qrItems);

        const statusOrder = { expired: 1, expiring: 2, valid: 3 };
        setItems(allItems.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]));

      } catch (err) {
        if (ignore) return;
        logger.error("Error fetching dashboard data", err, { companyId: currentCompany?.id });
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      ignore = true;
    };
  }, [currentCompany]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (searchQuery) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus) {
      result = result.filter(item => item.status === filterStatus);
    }

    if (filterType) {
      result = result.filter(item => item.type === filterType);
    }

    const [sortField, sortOrder] = sortBy.split('-');
    result.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else if (sortField === 'type') {
        aValue = a.type;
        bValue = b.type;
      } else if (sortField === 'expiration') {
        aValue = new Date(a.expirationDate).getTime();
        bValue = new Date(b.expirationDate).getTime();
      } else {
        const statusOrder = { expired: 1, expiring: 2, valid: 3 };
        aValue = statusOrder[a.status];
        bValue = statusOrder[b.status];
      }

      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return result;
  }, [items, searchQuery, sortBy, filterStatus, filterType]);

  const stats = useMemo(() => {
    const counts = { total: items.length, valid: 0, expiring: 0, expired: 0 };
    for (const item of items) {
      if (item.status === 'valid') counts.valid++;
      else if (item.status === 'expiring') counts.expiring++;
      else if (item.status === 'expired') counts.expired++;
    }
    return counts;
  }, [items]);

  const moduleCount = useMemo(() => {
    return new Set(items.map(item => item.type)).size;
  }, [items]);

  const typeOptions = Array.from(new Set(items.map(item => item.type))).sort();
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedItems.length / pageSize));
  const paginatedItems = filteredAndSortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleItemClick = (item: DashboardItem) => navigate(item.modulePath);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <PageLayout title="Inicio" subtitle="Control de vencimientos y estado de documentos">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Inicio" subtitle="Control de vencimientos y estado de documentos">
      <div className="flex flex-col h-full gap-4">
        {/* Metrics Row */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total documentos"
            value={stats.total}
            icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
            changeText={`${moduleCount} módulos activos`}
            variant="total"
          />
          <StatCard
            label="Vigentes"
            value={stats.valid}
            icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
            changeText="+3 este mes"
            variant="valid"
          />
          <StatCard
            label="Por vencer"
            value={stats.expiring}
            icon={<Clock className="h-3.5 w-3.5 text-amber-500" />}
            changeText="Próximos 30 días"
            variant="expiring"
          />
          <StatCard
            label="Vencidos"
            value={stats.expired}
            icon={<AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
            changeText="Requieren atención"
            variant="expired"
          />
        </div>

        {/* Table Section */}
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          {/* Title row */}
          <div className="flex-shrink-0 flex items-center justify-between w-full">
            <span className="text-lg font-bold text-neutral-900">
              Documentos recientes
            </span>
            <button
              type="button"
              onClick={() => {/* could navigate to all documents */}}
              className="flex items-center gap-1.5 focus:outline-none"
            >
              <span className="text-sm font-medium text-neutral-900">Ver todos</span>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-900" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex-shrink-0">
            <DashboardFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterStatus={filterStatus}
              onStatusChange={setFilterStatus}
              filterType={filterType}
              onTypeChange={setFilterType}
              typeOptions={typeOptions}
              sortOptions={SORT_OPTIONS}
              statusOptions={STATUS_OPTIONS}
            />
          </div>

          {/* Table */}
          {items.length === 0 ? (
            <div className="flex-1 min-h-0 flex items-center justify-center rounded-md border border-neutral-200 py-16">
              <div className="text-center">
                <p className="text-sm font-light text-neutral-500">
                  No hay elementos con vencimiento para mostrar.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <DashboardTable items={paginatedItems} onItemClick={handleItemClick} />
              <DashboardCards items={paginatedItems} onItemClick={handleItemClick} />
            </div>
          )}

          {/* Pagination */}
          {filteredAndSortedItems.length > 0 && (
            <div className="flex-shrink-0">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredAndSortedItems.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
