import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { QRDocumentType } from '../../types/index';
import { ROUTE_PATHS } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
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
  { value: 'status-asc', label: 'Estado: Critico primero' },
  { value: 'expiration-asc', label: 'Vencimiento: Mas proximo' },
  { value: 'expiration-desc', label: 'Vencimiento: Mas lejano' },
  { value: 'name-asc', label: 'Nombre: A-Z' },
  { value: 'name-desc', label: 'Nombre: Z-A' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'valid', label: 'Vigente' },
  { value: 'expiring', label: 'Proximo a vencer' },
  { value: 'expired', label: 'Vencido' },
];

const DashboardPage: React.FC = () => {
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
          type: 'Certificado de Conservacion',
          expirationDate: c.expirationDate,
          modulePath: ROUTE_PATHS.CONSERVATION_CERTIFICATES,
          status: calculateExpirationStatus(c.expirationDate)
        }));
        allItems.push(...certs);

        const systems = systemsData.map(s => ({
          id: s.id,
          name: `SPA - ${s.registrationNumber || s.intervener || 'Sin matricula'}`,
          type: 'Sistema de Autoproteccion',
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
            name: `Doc. ${doc.type}`,
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

  const typeOptions = Array.from(new Set(items.map(item => item.type))).sort();
  const totalPages = Math.ceil(filteredAndSortedItems.length / pageSize);
  const paginatedItems = filteredAndSortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleItemClick = (item: DashboardItem) => navigate(item.modulePath);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <PageLayout title={`Dashboard de ${currentCompany?.name || ''}`}>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Dashboard de ${currentCompany?.name}`}>
      <div className="flex flex-col h-full gap-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <StatCard label="Total" value={stats.total} icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />} variant="gray" />
          <StatCard label="Vigentes" value={stats.valid} icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />} variant="green" />
          <StatCard label="Por vencer" value={stats.expiring} icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />} variant="yellow" />
          <StatCard label="Vencidos" value={stats.expired} icon={<AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />} variant="red" />
        </div>

        {/* Main Content - Table Section */}
        <div className="flex-1 border border-gray-200 rounded-2xl shadow-sm bg-white flex flex-col min-h-0 overflow-hidden">
          {/* Table Header & Title */}
          <div className="border-gray-100 border-b px-4 py-4 sm:px-6 sm:py-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Control de Vencimientos</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Seguimiento de certificados y documentos</p>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="text-center">
                <h3 className="text-base font-medium text-gray-900 mb-1">Todo en orden</h3>
                <p className="text-sm text-gray-500">No hay elementos con vencimiento para mostrar.</p>
              </div>
            </div>
          ) : (
            <>
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

              <DashboardTable items={paginatedItems} onItemClick={handleItemClick} />
              <DashboardCards items={paginatedItems} onItemClick={handleItemClick} />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredAndSortedItems.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
