import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { EventInformation } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '@/lib/api/services';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth/AuthContext';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import { useToast } from '../../components/common/Toast';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DataTable } from '../../components/common/DataTable';
import PageLayout from '../../components/layout/PageLayout';
import { formatDateLocal } from '../../lib/utils/dateUtils';
import { Empty } from '../../components/common/Empty';

const EventInformationListPage = () => {
  const [events, setEvents] = useState<EventInformation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { currentCompany } = useAuth();

  const columns: ColumnDef<EventInformation, string>[] = [
    {
      accessorKey: 'description',
      header: 'Evento',
      cell: ({ row }) => (
        <span className="font-medium truncate block max-w-[300px]">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <Button variant="ghost" className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Fecha
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => formatDateLocal(row.original.date),
    },
    {
      accessorKey: 'time',
      header: 'Hora',
      cell: ({ row }) => row.original.time || '—',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(ROUTE_PATHS.EDIT_EVENT_INFORMATION.replace(':id', row.original.id)); }}>
              <Pencil className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(row.original.id); }}>
              <Trash2 className="h-4 w-4 text-destructive" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const loadEvents = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    try {
      const data = await api.getEvents(currentCompany.id);
      setEvents(data);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error al cargar información de eventos');
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, showError]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const prev = [...events];
    setEvents((e) => e.filter((ev) => ev.id !== deleteId));
    try {
      await api.deleteEvent(deleteId);
      showSuccess('Evento eliminado correctamente');
    } catch (err: unknown) {
      setEvents(prev);
      showError(err instanceof Error ? err.message : 'Error al eliminar el evento');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const headerActions = (
    <Button onClick={() => navigate(ROUTE_PATHS.NEW_EVENT_INFORMATION)}>
      <Plus className="w-4 h-4" />
      Nuevo evento
    </Button>
  );

  return (
    <PageLayout title={MODULE_TITLES.EVENT_INFORMATION} headerActions={headerActions}>
      {isLoading ? (
        <SkeletonTable />
      ) : events.length === 0 ? (
        <Empty
          icon="list"
          title="No hay eventos registrados"
          action={{
            label: 'Registrar primer evento',
            onClick: () => navigate(ROUTE_PATHS.NEW_EVENT_INFORMATION),
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={events}
          searchKey="description"
          searchPlaceholder="Buscar por descripción..."
        />
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar evento?"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};

export default EventInformationListPage;
