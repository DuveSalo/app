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
import { SplitPaneLayout } from '../../components/layout/SplitPaneLayout';
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    if (selectedId === deleteId) setSelectedId(null);
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

  useEffect(() => {
    if (filtered.length > 0 && !selectedId) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const headerActions = (
    <button
      type="button"
      onClick={() => navigate(ROUTE_PATHS.NEW_FIRE_EXTINGUISHER)}
      className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium focus:outline-none hover:bg-neutral-900 transition-colors"
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
            className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium focus:outline-none hover:bg-neutral-900 transition-colors"
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

          {/* ── Desktop: Split Pane ── */}
          <div className="hidden sm:flex flex-1 min-h-0">
            <SplitPaneLayout
              items={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
              listLabel="Extintores"
              renderListItem={(ext, isSelected) => (
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm ${isSelected ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-900'}`}>
                      N° {ext.extinguisherNumber}
                    </h3>
                    <span className="text-[10px] font-medium text-neutral-400 uppercase">{ext.type}</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Puesto {ext.positionNumber} · {formatDateLocal(ext.controlDate)}
                  </p>
                </div>
              )}
              renderDetail={(ext) => (
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-10">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-neutral-50 text-neutral-600 text-[10px] font-bold px-2 py-0.5 tracking-wide uppercase">
                          {ext.type}
                        </span>
                        <span className="text-neutral-400 text-xs tracking-wider">
                          N° {ext.extinguisherNumber}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                        Control de Extintor
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`${ROUTE_PATHS.FIRE_EXTINGUISHERS}/${ext.id}/edit`)}
                        className="p-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-500"
                        title="Editar"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(ext.id)}
                        className="p-2 border border-neutral-200 hover:bg-neutral-50 text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-3 gap-8 mb-12">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-500">Ubicación</p>
                      <p className="text-sm text-neutral-900">Puesto {ext.positionNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-500">Fecha de Control</p>
                      <p className="text-sm text-neutral-900">{formatDateLocal(ext.controlDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-500">Venc. Carga</p>
                      <p className="text-sm text-neutral-900">{formatDateLocal(ext.chargeExpirationDate)}</p>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-500">Venc. Presión Hidráulica</p>
                      <p className="text-sm text-neutral-900">{formatDateLocal(ext.hydraulicPressureExpirationDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-500">Año de Fabricación</p>
                      <p className="text-sm text-neutral-900">{ext.manufacturingYear || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-500">Color Etiqueta</p>
                      <p className="text-sm text-neutral-900">{ext.tagColor || '—'}</p>
                    </div>
                  </div>
                </>
              )}
            />
          </div>

          {/* ── Mobile Cards ── */}
          <div className="sm:hidden min-h-0 overflow-y-auto custom-scrollbar border border-neutral-200">
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
