
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventInformation } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '../../lib/api/supabaseApi';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import { EditIcon, TrashIcon, PlusIcon, ExclamationTriangleIcon } from '../../components/common/Icons';
import { FilterSort } from '../../components/common/FilterSort';
import { useToast } from '../../components/common/Toast';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import PageLayout from '../../components/layout/PageLayout';

const EventInformationListPage: React.FC = () => {
  const [events, setEvents] = useState<EventInformation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { currentCompany } = useAuth();

  const loadEvents = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    try {
      const data = await api.getEvents(currentCompany.id);
      setEvents(data);
    } catch (err: any) {
      showError(err.message || "Error al cargar información de eventos");
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, showError]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    setIsDeleting(true);

    // Optimistic update
    const previousEvents = [...events];
    setEvents(prev => prev.filter(event => event.id !== deleteId));

    try {
      await api.deleteEvent(deleteId);
      showSuccess('Evento eliminado correctamente');
    } catch (err: any) {
      // Revert optimistic update
      setEvents(previousEvents);
      showError(err.message || "Error al eliminar el evento");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Filter and sort
  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];

    // Filter by search
    if (searchQuery) {
      result = result.filter(event =>
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    const [sortField, sortOrder] = sortBy.split('-');
    result.sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else if (sortField === 'description') {
        aValue = a.description;
        bValue = b.description;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [events, searchQuery, sortBy]);

  const sortOptions = [
    { value: 'date-desc', label: 'Fecha: Más reciente' },
    { value: 'date-asc', label: 'Fecha: Más antigua' },
    { value: 'description-asc', label: 'Descripción: A-Z' },
    { value: 'description-desc', label: 'Descripción: Z-A' },
  ];

  const headerActions = (
    <Button onClick={() => navigate(ROUTE_PATHS.NEW_EVENT_INFORMATION)}>
      <PlusIcon className="w-4 h-4 mr-2" />
      Nuevo evento
    </Button>
  );

  return (
    <PageLayout title={MODULE_TITLES.EVENT_INFORMATION} headerActions={headerActions}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center h-full bg-white rounded-xl border border-slate-300">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <ExclamationTriangleIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1.5">No hay eventos registrados</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">Comience registrando su primer evento o incidente.</p>
          <Button onClick={() => navigate(ROUTE_PATHS.NEW_EVENT_INFORMATION)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Registrar primer evento
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
            searchPlaceholder="Buscar por descripción..."
          />

          <div className="bg-white rounded-xl border border-slate-300 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-center">Fecha</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedEvents.map((event) => (
                  <TableRow
                    key={event.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="font-medium">{event.description}</TableCell>
                    <TableCell className="text-center">{new Date(event.date).toLocaleDateString('es-AR')}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200">
                        Registrado
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-0.5 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(ROUTE_PATHS.EDIT_EVENT_INFORMATION.replace(':id', event.id))}
                          title="Editar"
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(event.id)}
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

          {filteredAndSortedEvents.length === 0 && events.length > 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-300">
              <p className="text-sm text-slate-500">No se encontraron eventos con los filtros aplicados.</p>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar evento?"
        message="Esta acción no se puede deshacer. El evento será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};

export default EventInformationListPage;