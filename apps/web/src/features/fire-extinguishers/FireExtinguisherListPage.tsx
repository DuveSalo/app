import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { FireExtinguisherControl } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '@/lib/api/services';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../auth/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FilterSort } from '../../components/common/FilterSort';
import PageLayout from '../../components/layout/PageLayout';
import { formatDateLocal } from '../../lib/utils/dateUtils';

const SORT_OPTIONS = [
  { value: 'controlDate-desc', label: 'Fecha de Control (Más reciente)' },
  { value: 'controlDate-asc', label: 'Fecha de Control (Más antiguo)' },
  { value: 'extinguisherNumber-asc', label: 'N° Extintor (A-Z)' },
  { value: 'chargeExpirationDate-asc', label: 'Venc. Carga (Próximo)' },
];

const FireExtinguisherListPage = () => {
  const [extinguishers, setExtinguishers] = useState<FireExtinguisherControl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('controlDate-desc');
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { currentCompany } = useAuth();

  const loadExtinguishers = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    try {
      const data = await api.getFireExtinguishers(currentCompany.id);
      setExtinguishers(data);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error al cargar extintores");
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, showError]);

  useEffect(() => { loadExtinguishers(); }, [loadExtinguishers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.deleteFireExtinguisher(deleteId);
      showSuccess("Extintor eliminado correctamente");
      setDeleteId(null);
      loadExtinguishers();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error al eliminar extintor");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    let result = [...extinguishers];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => e.extinguisherNumber.toLowerCase().includes(q) || e.positionNumber.toLowerCase().includes(q) || e.type.toLowerCase().includes(q));
    }
    const [field, direction] = sortBy.split('-');
    result.sort((a, b) => {
      const aRaw = a[field as keyof FireExtinguisherControl];
      const bRaw = b[field as keyof FireExtinguisherControl];
      let aVal: string | number = typeof aRaw === 'string' ? aRaw : String(aRaw);
      let bVal: string | number = typeof bRaw === 'string' ? bRaw : String(bRaw);
      if (field === 'controlDate' || field === 'chargeExpirationDate') { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); }
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [extinguishers, searchQuery, sortBy]);

  const headerActions = (
    <button
      type="button"
      onClick={() => navigate(ROUTE_PATHS.NEW_FIRE_EXTINGUISHER)}
      className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium rounded-md focus:outline-none hover:bg-neutral-800 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Nuevo Control
    </button>
  );

  return (
    <PageLayout title={MODULE_TITLES.FIRE_EXTINGUISHERS} headerActions={headerActions}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
      ) : extinguishers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-sm text-neutral-500">No hay controles registrados.</p>
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.NEW_FIRE_EXTINGUISHER)}
            className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium rounded-md focus:outline-none hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar primer control
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-4">
          <div className="flex-shrink-0">
            <FilterSort searchValue={searchQuery} onSearchChange={setSearchQuery} sortValue={sortBy} onSortChange={setSortBy} sortOptions={SORT_OPTIONS} searchPlaceholder="Buscar por N° extintor, ubicación o tipo..." />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar rounded-md border border-neutral-200">
            {/* Desktop Table */}
            <table className="hidden sm:table w-full">
              <thead>
                <tr className="h-11 bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-5 text-xs font-medium text-neutral-900">N° Extintor</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[120px]">Tipo</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[120px]">Ubicación</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[130px]">Fecha Control</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[130px]">Venc. Carga</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[100px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ext) => (
                  <tr key={ext.id} className="h-13 border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <td className="px-5">
                      <span className="text-sm text-neutral-900">{ext.extinguisherNumber}</span>
                    </td>
                    <td className="px-4 w-[120px]">
                      <span className="text-sm text-neutral-500">{ext.type}</span>
                    </td>
                    <td className="px-4 w-[120px]">
                      <span className="text-sm text-neutral-500">Puesto {ext.positionNumber}</span>
                    </td>
                    <td className="px-4 w-[130px]">
                      <span className="text-sm text-neutral-500">{formatDateLocal(ext.controlDate)}</span>
                    </td>
                    <td className="px-4 w-[130px]">
                      <span className="text-sm text-neutral-500">{formatDateLocal(ext.chargeExpirationDate)}</span>
                    </td>
                    <td className="px-4 w-[100px]">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                          onClick={() => navigate(`${ROUTE_PATHS.FIRE_EXTINGUISHERS}/${ext.id}/edit`)}
                          title="Editar"
                        >
                          <Pencil className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          type="button"
                          className="text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                          onClick={() => setDeleteId(ext.id)}
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
              {filtered.map((ext) => (
                <div
                  key={ext.id}
                  onClick={() => navigate(`${ROUTE_PATHS.FIRE_EXTINGUISHERS}/${ext.id}/edit`)}
                  className="flex items-center cursor-pointer hover:bg-neutral-50 transition-colors p-3 gap-3 border-b border-neutral-200"
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <span className="text-sm text-neutral-900">{ext.extinguisherNumber} — {ext.type}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500">Puesto {ext.positionNumber}</span>
                      <span className="text-xs text-neutral-500">{formatDateLocal(ext.controlDate)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {filtered.length === 0 && extinguishers.length > 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-neutral-500">No se encontraron resultados.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Eliminar Control de Extintor" message="¿Está seguro de que desea eliminar este control? Esta acción no se puede deshacer." confirmText="Eliminar" isLoading={isDeleting} />
    </PageLayout>
  );
};

export default FireExtinguisherListPage;
