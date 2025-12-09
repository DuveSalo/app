import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, CheckCircle, TrendingUp, AlertCircle, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { QRDocumentType } from '../../types/index';
import { ROUTE_PATHS } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { useAuth } from '../auth/AuthContext';
import PageLayout from '../../components/layout/PageLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { calculateExpirationStatus } from '../../lib/utils/dateUtils';
import { ExpirationStatus } from '../../types/expirable';
import { createLogger } from '../../lib/utils/logger';

const logger = createLogger('DashboardPage');

interface DashboardItem {
  id: string;
  name: string;
  type: string;
  expirationDate: string;
  status: ExpirationStatus;
  modulePath: string;
}

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  variant: 'gray' | 'green' | 'yellow' | 'red';
}> = ({ label, value, icon, variant }) => {
  const styles = {
    gray: { bg: 'bg-gray-100', iconBg: 'bg-gray-200', text: 'text-gray-900', label: 'text-gray-500' },
    green: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600', label: 'text-emerald-600' },
    yellow: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600', label: 'text-amber-600' },
    red: { bg: 'bg-red-50', iconBg: 'bg-red-100', text: 'text-red-600', label: 'text-red-600' },
  }[variant];

  return (
    <div className={`${styles.bg} rounded-xl p-4 border border-gray-200`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${styles.label} mb-2`}>{label}</p>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`text-2xl font-bold ${styles.text}`}>{value}</span>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('expiration-asc');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const { currentCompany } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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

      } catch (err: any) {
        logger.error("Error fetching dashboard data", err, { companyId: currentCompany?.id });
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
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
      let aValue: any, bValue: any;

      if (sortField === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else if (sortField === 'type') {
        aValue = a.type;
        bValue = b.type;
      } else if (sortField === 'expiration') {
        aValue = new Date(a.expirationDate).getTime();
        bValue = new Date(b.expirationDate).getTime();
      } else if (sortField === 'status') {
        const statusOrder = { expired: 1, expiring: 2, valid: 3 };
        aValue = statusOrder[a.status];
        bValue = statusOrder[b.status];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [items, searchQuery, sortBy, filterStatus, filterType]);

  const stats = {
    total: items.length,
    valid: items.filter(item => item.status === 'valid').length,
    expiring: items.filter(item => item.status === 'expiring').length,
    expired: items.filter(item => item.status === 'expired').length
  };

  const typeOptions = Array.from(new Set(items.map((item: DashboardItem) => item.type))).sort();

  const handleItemClick = (item: DashboardItem) => {
    navigate(item.modulePath);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);

  const totalPages = Math.ceil(filteredAndSortedItems.length / pageSize);
  const paginatedItems = filteredAndSortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const sortOptions = [
    { value: 'status-asc', label: 'Estado: Critico primero' },
    { value: 'expiration-asc', label: 'Vencimiento: Mas proximo' },
    { value: 'expiration-desc', label: 'Vencimiento: Mas lejano' },
    { value: 'name-asc', label: 'Nombre: A-Z' },
    { value: 'name-desc', label: 'Nombre: Z-A' },
  ];

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'valid', label: 'Vigente' },
    { value: 'expiring', label: 'Proximo a vencer' },
    { value: 'expired', label: 'Vencido' },
  ];

  const getStatusBadge = (status: ExpirationStatus) => {
    const config = {
      valid: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200/50', label: 'Vigente' },
      expiring: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200/50', label: 'Por vencer' },
      expired: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200/50', label: 'Vencido' },
    }[status];

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        <CheckCircle className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
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
        <div className="grid grid-cols-4 gap-3">
          <StatCard
            label="Total"
            value={stats.total}
            icon={<Calendar className="w-5 h-5 text-gray-600" />}
            variant="gray"
          />
          <StatCard
            label="Vigentes"
            value={stats.valid}
            icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
            variant="green"
          />
          <StatCard
            label="Por vencer"
            value={stats.expiring}
            icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
            variant="yellow"
          />
          <StatCard
            label="Vencidos"
            value={stats.expired}
            icon={<AlertCircle className="w-5 h-5 text-red-600" />}
            variant="red"
          />
        </div>

        {/* Main Content - Table Section */}
        <div className="flex-1 border border-gray-200 rounded-2xl shadow-sm bg-white flex flex-col min-h-0 overflow-hidden">
          {/* Table Header & Title */}
          <div className="border-gray-100 border-b px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900">Control de Vencimientos</h2>
            <p className="text-gray-500 text-sm mt-1">Seguimiento de certificados y documentos</p>
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
              {/* Filters */}
              <div className="p-4 border-b border-gray-100 bg-white flex flex-col lg:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o tipo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-100 placeholder-gray-400 text-gray-700"
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-2 min-w-max"
                  >
                    {sortOptions.find(o => o.value === sortBy)?.label || 'Ordenar por'}
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showSortDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                      {sortOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${sortBy === option.value ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-2 min-w-max"
                  >
                    {filterStatus ? statusOptions.find(o => o.value === filterStatus)?.label : 'Filtrar estado'}
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                      {statusOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => { setFilterStatus(option.value || undefined); setShowStatusDropdown(false); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterStatus === option.value ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Type Filter Dropdown */}
                {typeOptions.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-2 min-w-max"
                    >
                      {filterType || 'Todos los tipos'}
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showTypeDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                        <button
                          onClick={() => { setFilterType(undefined); setShowTypeDropdown(false); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${!filterType ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`}
                        >
                          Todos los tipos
                        </button>
                        {typeOptions.map(type => (
                          <button
                            key={type}
                            onClick={() => { setFilterType(type); setShowTypeDropdown(false); }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterType === type ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="uppercase text-xs font-medium text-gray-400 tracking-wider px-6 py-4">Nombre</th>
                      <th className="uppercase text-xs font-medium text-gray-400 tracking-wider px-6 py-4">Tipo</th>
                      <th className="uppercase text-xs font-medium text-gray-400 tracking-wider px-6 py-4">Vencimiento</th>
                      <th className="uppercase text-xs font-medium text-gray-400 tracking-wider px-6 py-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="text-base text-gray-700">
                    {paginatedItems.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      >
                        <td className="font-medium text-gray-900 px-6 py-4">{item.name}</td>
                        <td className="px-6 py-4 text-gray-600">{item.type}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(item.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 flex items-center justify-end gap-6 border-t border-gray-100">
                <span className="text-sm text-gray-500 font-medium">
                  {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, filteredAndSortedItems.length)} de {filteredAndSortedItems.length} elementos
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-sm font-semibold text-gray-900 bg-white">
                    {currentPage}
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Page Size Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowPageSizeDropdown(!showPageSizeDropdown)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-2"
                  >
                    {pageSize} / página
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {showPageSizeDropdown && (
                    <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {[10, 20, 50].map(size => (
                        <button
                          key={size}
                          onClick={() => { setPageSize(size); setCurrentPage(1); setShowPageSizeDropdown(false); }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${pageSize === size ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`}
                        >
                          {size} / página
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
