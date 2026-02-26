import { useState, useEffect, useCallback } from 'react';
import { Shield, Activity, TrendingUp, Users } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/common/Card';
import { AuditLogList } from './components/AuditLogList';
import { AuditFilters } from './components/AuditFilters';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/common/Toast';
import type { AuditLog, AuditFilters as AuditFiltersType, AuditStats } from '../../types/audit';
import * as auditApi from '../../lib/api/auditApi';
import { createLogger } from '../../lib/utils/logger';

const logger = createLogger('AuditPage');

export const AuditPage = () => {
  const { currentCompany } = useAuth();
  const { showError } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [filters, setFilters] = useState<AuditFiltersType>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const loadLogs = useCallback(async () => {
    if (!currentCompany) return;

    setIsLoading(true);
    try {
      const data = await auditApi.getAuditLogs(
        currentCompany.id,
        filters,
        pageSize,
        currentPage * pageSize
      );
      setLogs(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los registros de auditoria';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, filters, currentPage, showError]);

  const loadStats = useCallback(async () => {
    if (!currentCompany) return;

    try {
      const data = await auditApi.getAuditStats(
        currentCompany.id,
        filters.dateFrom,
        filters.dateTo
      );
      setStats(data);
    } catch (error: unknown) {
      logger.error('Error loading audit stats', error, { companyId: currentCompany.id });
    }
  }, [currentCompany, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [loadLogs, loadStats]);

  const handleFiltersChange = (newFilters: AuditFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  return (
    <PageLayout
      title="Auditoria"
      subtitle="Historial completo de cambios y acciones en el sistema"
      icon={<Shield className="w-8 h-8" />}
    >
      <div className="h-full flex flex-col">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 flex-shrink-0">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total de Registros</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalLogs}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Creaciones</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.insertCount}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Actualizaciones</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.updateCount}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.uniqueUsers}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex-shrink-0">
          <AuditFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Log list */}
        <div className="flex-1 min-h-0 overflow-y-auto mb-4">
          <AuditLogList logs={logs} isLoading={isLoading} />
        </div>

        {/* Pagination */}
        {logs.length >= pageSize && (
          <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-md p-4 flex-shrink-0">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="px-4 py-2 text-sm font-medium text-neutral-900 bg-white border border-neutral-200 rounded-md hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-neutral-600">
              Pagina {currentPage + 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={logs.length < pageSize}
              className="px-4 py-2 text-sm font-medium text-neutral-900 bg-white border border-neutral-200 rounded-md hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
