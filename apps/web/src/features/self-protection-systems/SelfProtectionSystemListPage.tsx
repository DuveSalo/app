import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, FileText, ChevronRight } from 'lucide-react';
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
import { SplitPaneLayout } from '../../components/layout/SplitPaneLayout';
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

const STATUS_DOT: Record<ExpirationStatus, string> = {
  valid: 'bg-emerald-600',
  expiring: 'bg-amber-600',
  expired: 'bg-red-600',
};

const SelfProtectionSystemListPage = () => {
  const [systems, setSystems] = useState<SelfProtectionSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('expirationDate-asc');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    if (selectedId === deleteId) setSelectedId(null);
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

  useEffect(() => {
    if (filtered.length > 0 && !selectedId) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const headerActions = (
    <button
      type="button"
      onClick={() => navigate(ROUTE_PATHS.NEW_SELF_PROTECTION_SYSTEM)}
      className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium focus:outline-none hover:bg-neutral-900 transition-colors"
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
            className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium focus:outline-none hover:bg-neutral-900 transition-colors"
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

          {/* ── Desktop: Split Pane ── */}
          <div className="hidden sm:flex flex-1 min-h-0">
            <SplitPaneLayout
              items={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
              listLabel="Sistemas"
              renderListItem={(sys, isSelected) => {
                const status = getStatus(sys.expirationDate);
                return (
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm ${isSelected ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-900'}`}>
                        {sys.intervener}
                      </h3>
                      <div className={`h-2 w-2 ${STATUS_DOT[status]}`} />
                    </div>
                    <p className="text-xs text-neutral-500">
                      {sys.registrationNumber} · Vence: {fmtDate(sys.expirationDate)}
                    </p>
                  </div>
                );
              }}
              renderDetail={(sys) => {
                const status = getStatus(sys.expirationDate);
                return (
                  <>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={status} />
                          <span className="text-neutral-400 text-xs tracking-wider">
                            MAT: {sys.registrationNumber}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                          {sys.intervener}
                        </h2>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(ROUTE_PATHS.EDIT_SELF_PROTECTION_SYSTEM.replace(':id', sys.id))}
                          className="p-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-500"
                          title="Editar"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(sys.id)}
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
                        <p className="text-xs font-medium text-neutral-500">Disp. Aprobatoria</p>
                        <p className="text-sm text-neutral-900">{fmtDate(sys.probatoryDispositionDate)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-neutral-500">Vencimiento</p>
                        <p className="text-sm text-neutral-900">{fmtDate(sys.expirationDate)}</p>
                      </div>
                      {sys.extensionDate && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-neutral-500">Extensión</p>
                          <p className="text-sm text-neutral-900">{fmtDate(sys.extensionDate)}</p>
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    <div className="mb-8">
                      <h4 className="text-xs font-medium text-neutral-500 mb-4">Documentos</h4>
                      <div className="flex flex-col gap-2">
                        {sys.probatoryDispositionPdfUrl ? (
                          <div className="flex items-center justify-between p-3 border border-neutral-200 bg-white rounded">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                              <span className="text-sm text-neutral-900 truncate">
                                {sys.probatoryDispositionPdfName || 'Disposición Aprobatoria'}
                              </span>
                            </div>
                            <a
                              href={sys.probatoryDispositionPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-neutral-900 hover:text-neutral-900 transition-colors flex-shrink-0 ml-3"
                            >
                              <Eye className="w-4 h-4" />
                              Ver PDF
                            </a>
                          </div>
                        ) : null}
                        {sys.extensionPdfUrl ? (
                          <div className="flex items-center justify-between p-3 border border-neutral-200 bg-white rounded">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                              <span className="text-sm text-neutral-900 truncate">
                                {sys.extensionPdfName || 'Extensión'}
                              </span>
                            </div>
                            <a
                              href={sys.extensionPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-neutral-900 hover:text-neutral-900 transition-colors flex-shrink-0 ml-3"
                            >
                              <Eye className="w-4 h-4" />
                              Ver PDF
                            </a>
                          </div>
                        ) : null}
                        {!sys.probatoryDispositionPdfUrl && !sys.extensionPdfUrl && (
                          <p className="text-sm text-neutral-500">Sin documentos adjuntos.</p>
                        )}
                      </div>
                    </div>

                    {/* Drills */}
                    <div>
                      <h4 className="text-xs font-medium text-neutral-500 mb-4">Simulacros</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        {sys.drills.map((drill, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border border-neutral-200 bg-white rounded">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-neutral-900">Simulacro {idx + 1}</span>
                                <span className="text-xs text-neutral-500">
                                  {drill.date ? fmtDate(drill.date) : 'Sin fecha'}
                                </span>
                              </div>
                            </div>
                            {drill.pdfUrl ? (
                              <a
                                href={drill.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-neutral-900 hover:text-neutral-900 transition-colors flex-shrink-0 ml-3"
                              >
                                <Eye className="w-4 h-4" />
                                Ver PDF
                              </a>
                            ) : (
                              <span className="text-xs text-neutral-400 flex-shrink-0 ml-3">Sin PDF</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              }}
            />
          </div>

          {/* ── Mobile Cards ── */}
          <div className="sm:hidden min-h-0 overflow-y-auto custom-scrollbar border border-neutral-200">
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
