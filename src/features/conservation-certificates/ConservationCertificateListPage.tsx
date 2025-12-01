
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConservationCertificate } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FilterSort } from '../../components/common/FilterSort';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EditIcon, TrashIcon, PlusIcon, DocumentTextIcon, EyeIcon } from '../../components/common/Icons';
import PageLayout from '../../components/layout/PageLayout';
import { calculateExpirationStatus } from '../../lib/utils/dateUtils';
import { ExpirationStatus } from '../../types/expirable';

const ConservationCertificateListPage: React.FC = () => {
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
    } catch (err: any) {
      showError(err.message || "Error al cargar certificados");
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, showError]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const getStatus = (expirationDate: string): ExpirationStatus => {
    return calculateExpirationStatus(expirationDate);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setIsDeleting(true);

    // Optimistic update
    const previousCertificates = [...certificates];
    setCertificates(prev => prev.filter(cert => cert.id !== deleteId));

    try {
      await api.deleteCertificate(deleteId);
      showSuccess('Certificado eliminado correctamente');
    } catch (err: any) {
      // Revert optimistic update
      setCertificates(previousCertificates);
      showError(err.message || "Error al eliminar certificado");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Filter and sort
  const filteredAndSortedCertificates = useMemo(() => {
    let result = [...certificates];

    // Filter by search
    if (searchQuery) {
      result = result.filter(cert =>
        cert.intervener.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus) {
      result = result.filter(cert => getStatus(cert.expirationDate) === filterStatus);
    }

    // Sort
    const [sortField, sortOrder] = sortBy.split('-');
    result.sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortField === 'intervener') {
        aValue = a.intervener;
        bValue = b.intervener;
      } else if (sortField === 'presentationDate') {
        aValue = new Date(a.presentationDate).getTime();
        bValue = new Date(b.presentationDate).getTime();
      } else if (sortField === 'expirationDate') {
        aValue = new Date(a.expirationDate).getTime();
        bValue = new Date(b.expirationDate).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [certificates, searchQuery, sortBy, filterStatus]);

  const sortOptions = [
    { value: 'expirationDate-asc', label: 'Vencimiento: Más próximo' },
    { value: 'expirationDate-desc', label: 'Vencimiento: Más lejano' },
    { value: 'presentationDate-desc', label: 'Presentación: Más reciente' },
    { value: 'presentationDate-asc', label: 'Presentación: Más antiguo' },
    { value: 'intervener-asc', label: 'Interviniente: A-Z' },
    { value: 'intervener-desc', label: 'Interviniente: Z-A' },
  ];

  const filterOptions = [
    { value: 'valid', label: 'Vigente' },
    { value: 'expiring', label: 'Próximo a vencer' },
    { value: 'expired', label: 'Vencido' },
  ];

  const headerActions = (
    <Button onClick={() => navigate(ROUTE_PATHS.NEW_CONSERVATION_CERTIFICATE)}>
      <PlusIcon className="w-4 h-4 mr-2" />
      Nuevo certificado
    </Button>
  );

  return (
    <PageLayout title={MODULE_TITLES.CONSERVATION_CERTIFICATES} headerActions={headerActions}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center h-full bg-white rounded-xl border border-slate-300">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <DocumentTextIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1.5">No hay certificados</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            Comience registrando su primer certificado de conservación para mantener el control de vencimientos.
          </p>
          <Button
            onClick={() => navigate(ROUTE_PATHS.NEW_CONSERVATION_CERTIFICATE)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Crear primer certificado
          </Button>
        </div>
      ) : (
        <>
          <FilterSort
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            sortValue={sortBy}
            onSortChange={setSortBy}
            sortOptions={sortOptions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            filterOptions={filterOptions}
            searchPlaceholder="Buscar por interviniente o N° de registro..."
          />

          <div className="bg-white rounded-xl border border-slate-300 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Interviniente</TableHead>
                  <TableHead className="w-[12%]">N° Registro</TableHead>
                  <TableHead className="w-[12%]">Presentación</TableHead>
                  <TableHead className="w-[12%]">Vencimiento</TableHead>
                  <TableHead className="w-[20%]">Archivo</TableHead>
                  <TableHead className="w-[10%]">Estado</TableHead>
                  <TableHead className="w-[9%]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCertificates.map((cert) => (
                  <TableRow
                    key={cert.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="font-medium max-w-0 truncate">{cert.intervener}</TableCell>
                    <TableCell className="text-xs">{cert.registrationNumber}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(cert.presentationDate).toLocaleDateString('es-AR')}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(cert.expirationDate).toLocaleDateString('es-AR')}</TableCell>
                    <TableCell className="max-w-0 truncate text-xs text-slate-500" title={cert.pdfFileName || 'N/A'}>
                      {cert.pdfFileName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={getStatus(cert.expirationDate)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          onClick={() => {
                            if (cert.pdfFile && typeof cert.pdfFile === 'string') {
                              window.open(cert.pdfFile, '_blank');
                            } else {
                              alert('No hay PDF disponible para este certificado. Suba un PDF editando el registro.');
                            }
                          }}
                          title="Ver PDF"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(ROUTE_PATHS.EDIT_CONSERVATION_CERTIFICATE.replace(':id', cert.id))}
                          title="Editar"
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(cert.id)}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedCertificates.length === 0 && certificates.length > 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-300">
              <p className="text-sm text-slate-500">No se encontraron certificados con los filtros aplicados.</p>
            </div>
          )}
        </>
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
