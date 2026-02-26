import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { SelfProtectionSystem } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '@/lib/api/services';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../auth/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FilterSort } from '../../components/common/FilterSort';
import { StatusBadge } from '../../components/common/StatusBadge';
import PageLayout from '../../components/layout/PageLayout';
import { calculateExpirationStatus } from '../../lib/utils/dateUtils';
import { ExpirationStatus } from '../../types/expirable';

const SORT_OPTIONS = [
  { value: 'expirationDate-asc', label: 'Vencimiento: Más próximo' },
  { value: 'expirationDate-desc', label: 'Vencimiento: Más lejano' },
  { value: 'probatoryDispositionDate-desc', label: 'Disp. Aprobatoria: Más reciente' },
  { value: 'intervener-asc', label: 'Interviniente: A-Z' },
];

const FILTER_OPTIONS = [
  { value: 'valid', label: 'Vigente' },
  { value: 'expiring', label: 'Próximo a vencer' },
  { value: 'expired', label: 'Vencido' },
];

const SelfProtectionSystemListPage = () => {
  const [systems, setSystems] = useState<SelfProtectionSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('expirationDate-asc');
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { currentCompany } = useAuth();

  const loadSystems = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    try {
      const data = await api.getSelfProtectionSystems(currentCompany.id);
      setSystems(data);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Error al cargar sistemas de autoprotección");
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, showError]);

  useEffect(() => { loadSystems(); }, [loadSystems]);

  const getStatus = (expirationDate: string): ExpirationStatus => calculateExpirationStatus(expirationDate);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const prev = [...systems];
    setSystems(s => s.filter(sys => sys.id !== deleteId));
    try {
      await api.deleteSelfProtectionSystem(deleteId);
      showSuccess('Sistema eliminado correctamente');
    } catch (err: unknown) {
      setSystems(prev);
      showError(err instanceof Error ? err.message : "Error al eliminar el sistema");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filtered = useMemo(() => {
    let result = [...systems];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.intervener.toLowerCase().includes(q) || s.registrationNumber.toLowerCase().includes(q));
    }
    if (filterStatus) result = result.filter(s => getStatus(s.expirationDate) === filterStatus);
    const [field, order] = sortBy.split('-');
    result.sort((a, b) => {
      let av: string | number, bv: string | number;
      if (field === 'intervener') { av = a.intervener; bv = b.intervener; }
      else if (field === 'probatoryDispositionDate') { av = a.probatoryDispositionDate ? new Date(a.probatoryDispositionDate).getTime() : 0; bv = b.probatoryDispositionDate ? new Date(b.probatoryDispositionDate).getTime() : 0; }
      else { av = new Date(a.expirationDate).getTime(); bv = new Date(b.expirationDate).getTime(); }
      return order === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return result;
  }, [systems, searchQuery, sortBy, filterStatus]);

  const fmtDate = (d: string | undefined) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : 'N/A';

  const headerActions = (
    <button
      type="button"
      onClick={() => navigate(ROUTE_PATHS.NEW_SELF_PROTECTION_SYSTEM)}
      className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium rounded-md focus:outline-none hover:bg-neutral-800 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Nuevo sistema
    </button>
  );

  return (
    <PageLayout title={MODULE_TITLES.SELF_PROTECTION_SYSTEMS} headerActions={headerActions}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
      ) : systems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-sm text-neutral-500">No hay sistemas registrados.</p>
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.NEW_SELF_PROTECTION_SYSTEM)}
            className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium rounded-md focus:outline-none hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear primer sistema
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-4">
          <div className="flex-shrink-0">
            <FilterSort
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              sortValue={sortBy}
              onSortChange={setSortBy}
              sortOptions={SORT_OPTIONS}
              filterValue={filterStatus}
              onFilterChange={setFilterStatus}
              filterOptions={FILTER_OPTIONS}
              searchPlaceholder="Buscar por interviniente o N° de matrícula..."
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar rounded-md border border-neutral-200">
            {/* Desktop Table */}
            <table className="hidden sm:table w-full">
              <thead>
                <tr className="h-11 bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-5 text-xs font-medium text-neutral-900">Interviniente</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[140px]">N° Matrícula</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[150px]">Disp. Aprobatoria</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[130px]">Vencimiento</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[140px]">Estado</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[100px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sys) => (
                  <tr key={sys.id} className="h-13 border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 truncate">
                      <span className="text-sm text-neutral-900 truncate">{sys.intervener}</span>
                    </td>
                    <td className="px-4 w-[140px]">
                      <span className="text-sm text-neutral-500">{sys.registrationNumber}</span>
                    </td>
                    <td className="px-4 w-[150px]">
                      <span className="text-sm text-neutral-500">{fmtDate(sys.probatoryDispositionDate)}</span>
                    </td>
                    <td className="px-4 w-[130px]">
                      <span className="text-sm text-neutral-500">{fmtDate(sys.expirationDate)}</span>
                    </td>
                    <td className="px-4 w-[140px]">
                      <StatusBadge status={getStatus(sys.expirationDate)} />
                    </td>
                    <td className="px-4 w-[100px]">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                          onClick={(e) => { e.stopPropagation(); navigate(ROUTE_PATHS.EDIT_SELF_PROTECTION_SYSTEM.replace(':id', sys.id)); }}
                          title="Editar"
                        >
                          <Pencil className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          type="button"
                          className="text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                          onClick={(e) => { e.stopPropagation(); setDeleteId(sys.id); }}
                          title="Eliminar"
                        >
                          <Trash2 className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="sm:hidden">
              {filtered.map((sys) => (
                <div
                  key={sys.id}
                  onClick={() => navigate(ROUTE_PATHS.EDIT_SELF_PROTECTION_SYSTEM.replace(':id', sys.id))}
                  className="flex items-center cursor-pointer hover:bg-neutral-50 transition-colors p-3 gap-3 border-b border-neutral-200"
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-sm text-neutral-900 truncate">{sys.intervener}</span>
                      <StatusBadge status={getStatus(sys.expirationDate)} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500">{sys.registrationNumber}</span>
                      <span className="text-xs text-neutral-500">{fmtDate(sys.expirationDate)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {filtered.length === 0 && systems.length > 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-neutral-500">No se encontraron resultados.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar sistema?"
        message="Esta acción no se puede deshacer. El sistema de autoprotección será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};

export default SelfProtectionSystemListPage;
