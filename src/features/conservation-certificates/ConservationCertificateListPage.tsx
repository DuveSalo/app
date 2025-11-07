
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConservationCertificate } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/common/Button';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FilterSort } from '../../components/common/FilterSort';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EditIcon, TrashIcon, PlusIcon, DocumentTextIcon } from '../../components/common/Icons';
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
        <SkeletonTable rows={5} />
      ) : certificates.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center h-full bg-white rounded-lg border border-gray-200">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay certificados</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Comience registrando su primer certificado de conservación para mantener el control de vencimientos.
          </p>
          <Button
            onClick={() => navigate(ROUTE_PATHS.NEW_CONSERVATION_CERTIFICATE)}
            size="lg"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
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

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interviniente</TableHead>
                  <TableHead>N° Registro</TableHead>
                  <TableHead>Presentación</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCertificates.map((cert, index) => (
                  <TableRow
                    key={cert.id}
                    className="hover:bg-gray-50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium">{cert.intervener}</TableCell>
                    <TableCell>{cert.registrationNumber}</TableCell>
                    <TableCell>{new Date(cert.presentationDate).toLocaleDateString('es-AR')}</TableCell>
                    <TableCell>{new Date(cert.expirationDate).toLocaleDateString('es-AR')}</TableCell>
                    <TableCell className="truncate max-w-xs text-sm text-gray-600">
                      {cert.pdfFileName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={getStatus(cert.expirationDate)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
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
                          className="text-red-600 hover:bg-red-50"
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
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No se encontraron certificados con los filtros aplicados.</p>
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
