import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Download } from 'lucide-react';
import { ConservationCertificate } from '../../types/index';
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
import { calculateExpirationStatus, formatDateLocal } from '../../lib/utils/dateUtils';
import { ExpirationStatus } from '../../types/expirable';

const SORT_OPTIONS = [
  { value: 'expirationDate-asc', label: 'Vencimiento: Más próximo' },
  { value: 'expirationDate-desc', label: 'Vencimiento: Más lejano' },
  { value: 'presentationDate-desc', label: 'Presentación: Más reciente' },
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

const ConservationCertificateListPage = () => {
  const [certificates, setCertificates] = useState<ConservationCertificate[]>([]);
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

  const loadCertificates = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    try {
      const data = await api.getCertificates(currentCompany.id);
      setCertificates(data);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Error al cargar certificados");
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, showError]);

  useEffect(() => { loadCertificates(); }, [loadCertificates]);

  const getStatus = (expirationDate: string): ExpirationStatus => calculateExpirationStatus(expirationDate);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const prev = [...certificates];
    setCertificates(c => c.filter(cert => cert.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    try {
      await api.deleteCertificate(deleteId);
      showSuccess('Certificado eliminado correctamente');
    } catch (err: unknown) {
      setCertificates(prev);
      showError(err instanceof Error ? err.message : "Error al eliminar certificado");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filtered = useMemo(() => {
    let result = [...certificates];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.intervener.toLowerCase().includes(q) || c.registrationNumber.toLowerCase().includes(q));
    }
    if (filterStatus) result = result.filter(c => getStatus(c.expirationDate) === filterStatus);
    const [field, order] = sortBy.split('-');
    result.sort((a, b) => {
      const av = field === 'intervener' ? a.intervener : new Date(a[field as keyof ConservationCertificate] as string).getTime();
      const bv = field === 'intervener' ? b.intervener : new Date(b[field as keyof ConservationCertificate] as string).getTime();
      return order === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return result;
  }, [certificates, searchQuery, sortBy, filterStatus]);

  // Auto-select first item
  useEffect(() => {
    if (filtered.length > 0 && !selectedId) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const headerActions = (
    <button
      type="button"
      onClick={() => navigate(ROUTE_PATHS.NEW_CONSERVATION_CERTIFICATE)}
      className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium focus:outline-none hover:bg-neutral-800 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Nuevo certificado
    </button>
  );

  return (
    <PageLayout title={MODULE_TITLES.CONSERVATION_CERTIFICATES} headerActions={headerActions}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
      ) : certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-sm text-neutral-500">No hay certificados registrados.</p>
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.NEW_CONSERVATION_CERTIFICATE)}
            className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium focus:outline-none hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear primer certificado
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
              searchPlaceholder="Buscar por interviniente o N° de registro..."
            />
          </div>

          {/* ── Desktop: Split Pane ── */}
          <div className="hidden sm:flex flex-1 min-h-0">
            <SplitPaneLayout
              items={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
              listLabel="Documentos"
              renderListItem={(cert, isSelected) => {
                const status = getStatus(cert.expirationDate);
                return (
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm ${isSelected ? 'font-medium text-neutral-900' : 'font-normal text-neutral-500'}`}>
                        {cert.intervener}
                      </h3>
                      <div className={`h-2 w-2 ${STATUS_DOT[status]}`} />
                    </div>
                    <p className="text-xs text-neutral-500">
                      {cert.registrationNumber} · {formatDateLocal(cert.expirationDate)}
                    </p>
                  </div>
                );
              }}
              renderDetail={(cert) => {
                const status = getStatus(cert.expirationDate);
                return (
                  <>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={status} />
                          <span className="text-neutral-400 text-xs tracking-wider">
                            REF: {cert.registrationNumber}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                          {cert.intervener}
                        </h2>
                      </div>
                      <div className="flex gap-2">
                        {cert.pdfFile && typeof cert.pdfFile === 'string' && (
                          <button
                            onClick={() => window.open(cert.pdfFile as string, '_blank')}
                            className="p-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-500"
                            title="Ver PDF"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(ROUTE_PATHS.EDIT_CONSERVATION_CERTIFICATE.replace(':id', cert.id))}
                          className="p-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-500"
                          title="Editar"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(cert.id)}
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
                        <p className="text-xs font-medium text-neutral-500">Fecha de Presentación</p>
                        <p className="text-sm text-neutral-900">{formatDateLocal(cert.presentationDate)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-neutral-500">Vencimiento</p>
                        <p className="text-sm text-neutral-900">{formatDateLocal(cert.expirationDate)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-neutral-500">Interviniente</p>
                        <p className="text-sm text-neutral-900">{cert.intervener}</p>
                      </div>
                    </div>

                    {/* Document Preview */}
                    {cert.pdfFile && typeof cert.pdfFile === 'string' && (
                      <div className="flex-1 flex flex-col">
                        <h4 className="text-xs font-medium text-neutral-500 mb-4">
                          Vista Previa del Documento
                        </h4>
                        <div className="flex-1 bg-neutral-50 border border-dashed border-neutral-200 flex items-center justify-center relative group min-h-[200px]">
                          <div className="absolute inset-0 bg-neutral-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => window.open(cert.pdfFile as string, '_blank')}
                              className="bg-white text-neutral-900 font-medium py-2 px-6 border border-neutral-200 flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Ver Documento Completo
                            </button>
                          </div>
                          <p className="text-xs text-neutral-400">Pase el cursor para ver el documento</p>
                        </div>
                      </div>
                    )}
                  </>
                );
              }}
            />
          </div>

          {/* ── Mobile Cards ── */}
          <div className="sm:hidden min-h-0 overflow-y-auto custom-scrollbar border border-neutral-200">
            {filtered.map((cert) => (
              <div
                key={cert.id}
                onClick={() => navigate(ROUTE_PATHS.EDIT_CONSERVATION_CERTIFICATE.replace(':id', cert.id))}
                className="flex items-center cursor-pointer hover:bg-neutral-50 transition-colors p-3 gap-3 border-b border-neutral-200"
              >
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm text-neutral-900 truncate">{cert.intervener}</span>
                    <StatusBadge status={getStatus(cert.expirationDate)} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500">{cert.registrationNumber}</span>
                    <span className="text-xs text-neutral-500">{formatDateLocal(cert.expirationDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && certificates.length > 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-neutral-500">
                No se encontraron resultados para &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar certificado?"
        message="Esta acción no se puede deshacer. El certificado será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};

export default ConservationCertificateListPage;
