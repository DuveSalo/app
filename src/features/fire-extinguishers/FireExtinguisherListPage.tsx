
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FireExtinguisherControl } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FilterSort } from '../../components/common/FilterSort';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { Empty, EmptySearch } from '../../components/common/Empty';
import { EditIcon, TrashIcon, PlusIcon } from '../../components/common/Icons';
import { Flame } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { formatDateLocal } from '../../lib/utils/dateUtils';

const FireExtinguisherListPage: React.FC = () => {
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
      const message = err instanceof Error ? err.message : "Error al cargar extintores";
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, showError]);

  useEffect(() => {
    loadExtinguishers();
  }, [loadExtinguishers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.deleteFireExtinguisher(deleteId);
      showSuccess("Extintor eliminado correctamente");
      setDeleteId(null);
      loadExtinguishers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar extintor";
      showError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAndSortedExtinguishers = useMemo(() => {
    let result = [...extinguishers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ext =>
        ext.extinguisherNumber.toLowerCase().includes(query) ||
        ext.positionNumber.toLowerCase().includes(query) ||
        ext.type.toLowerCase().includes(query)
      );
    }

    // Sort
    const [field, direction] = sortBy.split('-');
    result.sort((a, b) => {
      const aRaw = a[field as keyof FireExtinguisherControl];
      const bRaw = b[field as keyof FireExtinguisherControl];

      let aVal: string | number = typeof aRaw === 'string' ? aRaw : String(aRaw);
      let bVal: string | number = typeof bRaw === 'string' ? bRaw : String(bRaw);

      if (field === 'controlDate' || field === 'chargeExpirationDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [extinguishers, searchQuery, sortBy]);

  const sortOptions = [
    { value: 'controlDate-desc', label: 'Fecha de Control (Más reciente)' },
    { value: 'controlDate-asc', label: 'Fecha de Control (Más antiguo)' },
    { value: 'extinguisherNumber-asc', label: 'Número de Extintor (A-Z)' },
    { value: 'extinguisherNumber-desc', label: 'Número de Extintor (Z-A)' },
    { value: 'chargeExpirationDate-asc', label: 'Vencimiento de Carga (Próximo)' },
    { value: 'chargeExpirationDate-desc', label: 'Vencimiento de Carga (Lejano)' },
  ];

  const headerActions = (
    <Button onClick={() => navigate(ROUTE_PATHS.NEW_FIRE_EXTINGUISHER)}>
      <PlusIcon className="w-4 h-4 mr-2" />
      Nuevo Control
    </Button>
  );

  return (
    <PageLayout title={MODULE_TITLES.FIRE_EXTINGUISHERS} headerActions={headerActions}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : extinguishers.length === 0 ? (
          <Empty
            icon={Flame}
            title="No hay controles registrados"
            description="Comience registrando su primer control de extintor."
            size="lg"
            action={{
              label: "Registrar primer control",
              onClick: () => navigate(ROUTE_PATHS.NEW_FIRE_EXTINGUISHER),
            }}
          />
      ) : (
        <>
          <FilterSort
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            sortValue={sortBy}
            onSortChange={setSortBy}
            sortOptions={sortOptions}
            searchPlaceholder="Buscar por número de extintor, ubicación o tipo..."
          />

          {filteredAndSortedExtinguishers.length === 0 ? (
              <EmptySearch
                query={searchQuery}
                description="Intenta con otros términos de búsqueda."
              />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="bg-white rounded-xl border border-slate-300 overflow-hidden hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Extintor</TableHead>
                      <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                      <TableHead className="hidden lg:table-cell">Capacidad</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead className="hidden sm:table-cell">Fecha Control</TableHead>
                      <TableHead className="hidden xl:table-cell">Venc. Carga</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedExtinguishers.map((ext) => (
                      <TableRow key={ext.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium">{ext.extinguisherNumber}</TableCell>
                        <TableCell className="hidden lg:table-cell">{ext.type}</TableCell>
                        <TableCell className="hidden lg:table-cell">{ext.capacity} kg</TableCell>
                        <TableCell>Puesto {ext.positionNumber}</TableCell>
                        <TableCell className="hidden sm:table-cell">{formatDateLocal(ext.controlDate)}</TableCell>
                        <TableCell className="hidden xl:table-cell">{formatDateLocal(ext.chargeExpirationDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`${ROUTE_PATHS.FIRE_EXTINGUISHERS}/${ext.id}/edit`)}
                              title="Editar"
                            >
                              <EditIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(ext.id)}
                              title="Eliminar"
                              className="text-red-500 hover:bg-red-50 hover:text-red-600"
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

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredAndSortedExtinguishers.map((ext) => (
                  <div
                    key={ext.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{ext.extinguisherNumber}</p>
                        <p className="text-sm text-gray-500">{ext.type} - {ext.capacity} kg</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`${ROUTE_PATHS.FIRE_EXTINGUISHERS}/${ext.id}/edit`)}
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(ext.id)}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs">Ubicación</p>
                        <p className="text-gray-700">Puesto {ext.positionNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Fecha Control</p>
                        <p className="text-gray-700">{formatDateLocal(ext.controlDate)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-400 text-xs">Venc. Carga</p>
                        <p className="text-gray-700">{formatDateLocal(ext.chargeExpirationDate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Control de Extintor"
        message="¿Está seguro de que desea eliminar este control? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};

export default FireExtinguisherListPage;
