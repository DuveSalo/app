
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
import { EditIcon, TrashIcon, PlusIcon, FireIcon } from '../../components/common/Icons';
import PageLayout from '../../components/layout/PageLayout';

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
    } catch (err: any) {
      showError(err.message || "Error al cargar extintores");
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
    } catch (err: any) {
      showError(err.message || "Error al eliminar extintor");
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
      let aVal: any = a[field as keyof FireExtinguisherControl];
      let bVal: any = b[field as keyof FireExtinguisherControl];

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
        <div className="text-center py-16 flex flex-col items-center justify-center h-full">
          <FireIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay controles de extintores registrados</h3>
          <p className="text-gray-500 mb-4">Comience registrando su primer control de extintor.</p>
          <Button onClick={() => navigate(ROUTE_PATHS.NEW_FIRE_EXTINGUISHER)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Registrar primer control
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
            searchPlaceholder="Buscar por número de extintor, ubicación o tipo..."
          />

          {filteredAndSortedExtinguishers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 mb-4">No se encontraron extintores que coincidan con la búsqueda.</p>
            </div>
          ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Extintor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Fecha Control</TableHead>
                <TableHead>Venc. Carga</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedExtinguishers.map((ext) => (
                <TableRow key={ext.id}>
                  <TableCell className="font-medium">{ext.extinguisherNumber}</TableCell>
                  <TableCell>{ext.type}</TableCell>
                  <TableCell>{ext.capacity} kg</TableCell>
                  <TableCell>Puesto {ext.positionNumber}</TableCell>
                  <TableCell>{new Date(ext.controlDate).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell>{new Date(ext.chargeExpirationDate).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                      >
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
