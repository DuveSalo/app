import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { EventInformation } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '@/lib/api/services';
import { useAuth } from '../auth/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FilterSort } from '../../components/common/FilterSort';
import { useToast } from '../../components/common/Toast';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import PageLayout from '../../components/layout/PageLayout';
import { formatDateLocal } from '../../lib/utils/dateUtils';

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Fecha: Más reciente' },
  { value: 'date-asc', label: 'Fecha: Más antigua' },
  { value: 'description-asc', label: 'Descripción: A-Z' },
];

const EventInformationListPage = () => {
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
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Error al cargar información de eventos");
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, showError]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const prev = [...events];
    setEvents(e => e.filter(ev => ev.id !== deleteId));
    try {
      await api.deleteEvent(deleteId);
      showSuccess('Evento eliminado correctamente');
    } catch (err: unknown) {
      setEvents(prev);
      showError(err instanceof Error ? err.message : "Error al eliminar el evento");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filtered = useMemo(() => {
    let result = [...events];
    if (searchQuery) result = result.filter(e => e.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const [field, order] = sortBy.split('-');
    result.sort((a, b) => {
      const av = field === 'date' ? new Date(a.date).getTime() : a.description;
      const bv = field === 'date' ? new Date(b.date).getTime() : b.description;
      return order === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return result;
  }, [events, searchQuery, sortBy]);

  const headerActions = (
    <button
      type="button"
      onClick={() => navigate(ROUTE_PATHS.NEW_EVENT_INFORMATION)}
      className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium rounded-md focus:outline-none hover:bg-neutral-800 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Nuevo evento
    </button>
  );

  return (
    <PageLayout title={MODULE_TITLES.EVENT_INFORMATION} headerActions={headerActions}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-sm text-neutral-500">No hay eventos registrados.</p>
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.NEW_EVENT_INFORMATION)}
            className="flex items-center h-9 px-5 gap-2 bg-neutral-900 text-white text-sm font-medium rounded-md focus:outline-none hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar primer evento
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-4">
          <div className="flex-shrink-0">
            <FilterSort searchValue={searchQuery} onSearchChange={setSearchQuery} sortValue={sortBy} onSortChange={setSortBy} sortOptions={SORT_OPTIONS} searchPlaceholder="Buscar por descripción..." />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar rounded-md border border-neutral-200">
            {/* Desktop Table */}
            <table className="hidden sm:table w-full">
              <thead>
                <tr className="h-11 bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-5 text-xs font-medium text-neutral-900">Descripción</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[130px]">Fecha</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[120px]">Estado</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[130px]">Hora</th>
                  <th className="text-left px-4 text-xs font-medium text-neutral-900 w-[100px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => (
                  <tr key={event.id} className="h-13 border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 truncate">
                      <span className="text-sm text-neutral-900 truncate">{event.description}</span>
                    </td>
                    <td className="px-4 w-[130px]">
                      <span className="text-sm text-neutral-500">{formatDateLocal(event.date)}</span>
                    </td>
                    <td className="px-4 w-[120px]">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">Registrado</span>
                    </td>
                    <td className="px-4 w-[130px]">
                      <span className="text-sm text-neutral-500">{event.time || '—'}</span>
                    </td>
                    <td className="px-4 w-[100px]">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                          onClick={() => navigate(ROUTE_PATHS.EDIT_EVENT_INFORMATION.replace(':id', event.id))}
                          title="Editar"
                        >
                          <Pencil className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          type="button"
                          className="text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
                          onClick={() => setDeleteId(event.id)}
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
              {filtered.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(ROUTE_PATHS.EDIT_EVENT_INFORMATION.replace(':id', event.id))}
                  className="flex items-center cursor-pointer hover:bg-neutral-50 transition-colors p-3 gap-3 border-b border-neutral-200"
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <span className="text-sm text-neutral-900 truncate">{event.description}</span>
                    <span className="text-xs text-neutral-500">{formatDateLocal(event.date)}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {filtered.length === 0 && events.length > 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-neutral-500">No se encontraron resultados.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handleDeleteConfirm} title="¿Eliminar evento?" message="Esta acción no se puede deshacer." confirmText="Eliminar" cancelText="Cancelar" variant="danger" isLoading={isDeleting} />
    </PageLayout>
  );
};

export default EventInformationListPage;
