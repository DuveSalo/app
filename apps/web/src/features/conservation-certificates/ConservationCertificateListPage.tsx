import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, ChevronRight } from 'lucide-react';
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

const ConservationCertificateListPage = () => {
  const [certificates, setCertificates] = useState<ConservationCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('expirationDate-asc');
  const [filterStatus, setFilterStatus] = useState('');
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

  const headerActions = (
    <button
      type="button"
      onClick={() => navigate(ROUTE_PATHS.NEW_CONSERVATION_CERTIFICATE)}
      className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium rounded-md focus:outline-none hover:bg-neutral-800 transition-colors"
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
            className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium rounded-md focus:outline-none hover:bg-neutral-800 transition-colors"
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

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar rounded-md border border-neutral-200">
            {/* Desktop Table */}
            <table className="hidden sm:table w-full">
              <thead>
                <tr className="h-11 bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-5 text-xs font-medium text-neutral-900">Interviniente</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[140px]">N° Registro</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[130px]">Presentación</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[130px]">Vencimiento</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[140px]">Estado</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[100px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cert) => (
                  <tr key={cert.id} className="h-13 border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 truncate">
                      <span className="text-sm text-neutral-900 truncate">{cert.intervener}</span>
                    </td>
                    <td className="px-4 w-[140px]">
                      <span className="text-sm text-neutral-500">{cert.registrationNumber}</span>
                    </td>
                    <td className="px-4 w-[130px]">
                      <span className="text-sm text-neutral-500">{formatDateLocal(cert.presentationDate)}</span>
                    </td>
                    <td className="px-4 w-[130px]">
                      <span className="text-sm text-neutral-500">{formatDateLocal(cert.expirationDate)}</span>
                    </td>
                    <td className="px-4 w-[140px]">
                      <StatusBadge status={getStatus(cert.expirationDate)} />
                    </td>
                    <td className="px-4 w-[100px]">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cert.pdfFile && typeof cert.pdfFile === 'string') window.open(cert.pdfFile, '_blank');
                          }}
                          title="Ver PDF"
                        >
                          <Eye className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          type="button"
                          className="text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                          onClick={(e) => { e.stopPropagation(); navigate(ROUTE_PATHS.EDIT_CONSERVATION_CERTIFICATE.replace(':id', cert.id)); }}
                          title="Editar"
                        >
                          <Pencil className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          type="button"
                          className="text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                          onClick={(e) => { e.stopPropagation(); setDeleteId(cert.id); }}
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
                  <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                </div>
              ))}
            </div>
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
