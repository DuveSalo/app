
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelfProtectionSystem } from '../../types/index';
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
import { EditIcon, TrashIcon, PlusIcon, ShieldCheckIcon, EyeIcon, ChevronDownIcon } from '../../components/common/Icons';
import PageLayout from '../../components/layout/PageLayout';
import { calculateExpirationStatus } from '../../lib/utils/dateUtils';
import { ExpirationStatus } from '../../types/expirable';

const SelfProtectionSystemListPage: React.FC = () => {
  const [systems, setSystems] = useState<SelfProtectionSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('expirationDate-asc');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { currentCompany } = useAuth();

  const loadSystems = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    try {
      const data = await api.getSelfProtectionSystems(currentCompany.id);
      setSystems(data);
    } catch (err: any) {
      showError(err.message || "Error al cargar sistemas de autoprotección");
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, showError]);

  useEffect(() => {
    loadSystems();
  }, [loadSystems]);

  const getStatus = (expirationDate: string): ExpirationStatus => {
    return calculateExpirationStatus(expirationDate);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setIsDeleting(true);

    // Optimistic update
    const previousSystems = [...systems];
    setSystems(prev => prev.filter(sys => sys.id !== deleteId));

    try {
      await api.deleteSelfProtectionSystem(deleteId);
      showSuccess('Sistema eliminado correctamente');
    } catch (err: any) {
      // Revert optimistic update
      setSystems(previousSystems);
      showError(err.message || "Error al eliminar el sistema");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Filter and sort
  const filteredAndSortedSystems = useMemo(() => {
    let result = [...systems];

    // Filter by search
    if (searchQuery) {
      result = result.filter(sys =>
        sys.intervener.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sys.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus) {
      result = result.filter(sys => getStatus(sys.expirationDate) === filterStatus);
    }

    // Sort
    const [sortField, sortOrder] = sortBy.split('-');
    result.sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortField === 'intervener') {
        aValue = a.intervener;
        bValue = b.intervener;
      } else if (sortField === 'probatoryDispositionDate') {
        aValue = a.probatoryDispositionDate ? new Date(a.probatoryDispositionDate).getTime() : 0;
        bValue = b.probatoryDispositionDate ? new Date(b.probatoryDispositionDate).getTime() : 0;
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
  }, [systems, searchQuery, sortBy, filterStatus]);

  const sortOptions = [
    { value: 'expirationDate-asc', label: 'Vencimiento: Más próximo' },
    { value: 'expirationDate-desc', label: 'Vencimiento: Más lejano' },
    { value: 'probatoryDispositionDate-desc', label: 'Disp. Aprobatoria: Más reciente' },
    { value: 'probatoryDispositionDate-asc', label: 'Disp. Aprobatoria: Más antigua' },
    { value: 'intervener-asc', label: 'Interviniente: A-Z' },
    { value: 'intervener-desc', label: 'Interviniente: Z-A' },
  ];

  const filterOptions = [
    { value: 'valid', label: 'Vigente' },
    { value: 'expiring', label: 'Próximo a vencer' },
    { value: 'expired', label: 'Vencido' },
  ];

  const headerActions = (
    <Button onClick={() => navigate(ROUTE_PATHS.NEW_SELF_PROTECTION_SYSTEM)}>
      <PlusIcon className="w-4 h-4 mr-2" />
      Nuevo sistema
    </Button>
  );

  return (
    <PageLayout title={MODULE_TITLES.SELF_PROTECTION_SYSTEMS} headerActions={headerActions}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : systems.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center h-full bg-white rounded-lg border border-gray-200">
          <ShieldCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay sistemas registrados</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Comience registrando su primer sistema de autoprotección para mantener el control de vencimientos.
          </p>
          <Button
            onClick={() => navigate(ROUTE_PATHS.NEW_SELF_PROTECTION_SYSTEM)}
            size="lg"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Crear primer sistema
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
            searchPlaceholder="Buscar por interviniente o N° de matrícula..."
          />

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Interviniente</TableHead>
                  <TableHead>N° Matrícula</TableHead>
                  <TableHead>Disp. Aprobatoria</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedSystems.map((sys, index) => {
                  const isExpanded = expandedRows.has(sys.id);
                  return (
                    <React.Fragment key={sys.id}>
                      <TableRow
                        className="hover:bg-gray-50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => toggleRow(sys.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title={isExpanded ? "Contraer" : "Expandir"}
                          >
                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </TableCell>
                        <TableCell className="font-medium">{sys.intervener}</TableCell>
                        <TableCell>{sys.registrationNumber}</TableCell>
                        <TableCell>{sys.probatoryDispositionDate ? new Date(sys.probatoryDispositionDate + 'T00:00:00').toLocaleDateString('es-AR') : 'N/A'}</TableCell>
                        <TableCell>{new Date(sys.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}</TableCell>
                        <TableCell>
                          <StatusBadge status={getStatus(sys.expirationDate)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(ROUTE_PATHS.EDIT_SELF_PROTECTION_SYSTEM.replace(':id', sys.id))}
                              title="Editar"
                            >
                              <EditIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(sys.id)}
                              className="text-red-600 hover:bg-red-50"
                              title="Eliminar"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-gray-50">
                          <TableCell colSpan={7} className="p-0">
                            <div className="p-6 space-y-4">
                              {/* Disposición Aprobatoria */}
                              {sys.probatoryDispositionDate && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                  <div className="flex-1">
                                    <span className="font-medium text-gray-700">Disposición Aprobatoria:</span>
                                    <span className="ml-2 text-gray-600">{new Date(sys.probatoryDispositionDate + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                                  </div>
                                  {sys.probatoryDispositionPdfUrl && (
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
                                      onClick={() => window.open(sys.probatoryDispositionPdfUrl, '_blank')}
                                      title="Ver PDF"
                                    >
                                      <EyeIcon className="w-4 h-4 mr-1" />
                                      Ver PDF
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Extensión */}
                              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-700">Extensión:</span>
                                  <span className="ml-2 text-gray-600">{new Date(sys.extensionDate + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                                </div>
                                {sys.extensionPdfUrl && (
                                  <button
                                    type="button"
                                    className="inline-flex items-center justify-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
                                    onClick={() => window.open(sys.extensionPdfUrl, '_blank')}
                                    title="Ver PDF"
                                  >
                                    <EyeIcon className="w-4 h-4 mr-1" />
                                    Ver PDF
                                  </button>
                                )}
                              </div>

                              {/* Vencimiento */}
                              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-700">Vencimiento:</span>
                                  <span className="ml-2 text-gray-600">{new Date(sys.expirationDate + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                                </div>
                              </div>

                              {/* Simulacros */}
                              {sys.drills && sys.drills.length > 0 && (
                                <div className="pt-2">
                                  <h4 className="font-medium text-gray-700 mb-3">Simulacros:</h4>
                                  <div className="space-y-2">
                                    {sys.drills.map((drill, idx) => (
                                      <div key={idx} className="flex items-center justify-between py-2 pl-4 border-l-2 border-gray-300">
                                        <div className="flex-1">
                                          <span className="text-gray-600">Simulacro {idx + 1}:</span>
                                          <span className="ml-2 text-gray-600">{new Date(drill.date + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                                        </div>
                                        {drill.pdfUrl && (
                                          <button
                                            type="button"
                                            className="inline-flex items-center justify-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
                                            onClick={() => window.open(drill.pdfUrl, '_blank')}
                                            title="Ver PDF"
                                          >
                                            <EyeIcon className="w-4 h-4 mr-1" />
                                            Ver PDF
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedSystems.length === 0 && systems.length > 0 && (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No se encontraron sistemas con los filtros aplicados.</p>
            </div>
          )}
        </>
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