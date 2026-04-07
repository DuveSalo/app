import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { EventInformation } from '../../types/index';
import { ROUTE_PATHS, MODULE_TITLES } from '../../constants/index';
import * as api from '@/lib/api/services';
import { queryKeys } from '@/lib/queryKeys';
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
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DataTable } from '../../components/common/DataTable';
import PageLayout from '../../components/layout/PageLayout';
import { formatDateLocal } from '../../lib/utils/dateUtils';
import { Empty } from '../../components/common/Empty';

const EventInformationListPage = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: queryKeys.events.list(currentCompany?.id ?? ''),
    queryFn: () => api.getEvents(currentCompany!.id),
    enabled: !!currentCompany,
  });

  const columns: ColumnDef<EventInformation, string>[] = [
    {
      accessorKey: 'description',
      header: 'Evento',
      cell: ({ row }) => (
        <span className="font-medium truncate block max-w-[300px]">{row.original.description}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fecha
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => formatDateLocal(row.original.date),
      meta: { hideOnMobile: true },
    },
    {
      accessorKey: 'time',
      header: 'Hora',
      cell: ({ row }) => row.original.time || '—',
      meta: { hideOnMobile: true },
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
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                navigate(ROUTE_PATHS.EDIT_EVENT_INFORMATION.replace(':id', row.original.id));
              }}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(row.original.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleDeleteConfirm = async () => {
    if (!deleteId || !currentCompany) return;
    setIsDeleting(true);
    try {
      await api.deleteEvent(deleteId);
      toast.success('Evento eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: queryKeys.events.list(currentCompany.id) });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar el evento');
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
          cardRenderer={(row) => (
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{row.description}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {formatDateLocal(row.date)} · {row.time || '—'}
              </div>
              <div className="mt-2 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(ROUTE_PATHS.EDIT_EVENT_INFORMATION.replace(':id', row.id))
                      }
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteId(row.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
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
        variant="destructive"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};

export default EventInformationListPage;
