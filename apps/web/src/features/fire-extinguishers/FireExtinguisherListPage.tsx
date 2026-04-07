import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { FireExtinguisherControl } from '../../types/index';
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
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/AuthContext';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatusFilter, statusFilterFn } from '../../components/common/StatusFilter';
import PageLayout from '../../components/layout/PageLayout';
import { formatDateLocal, calculateExpirationStatus } from '../../lib/utils/dateUtils';
import { Empty } from '../../components/common/Empty';

const FireExtinguisherListPage = () => {
  const [extinguishers, setExtinguishers] = useState<FireExtinguisherControl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentCompany } = useAuth();

  const columns: ColumnDef<FireExtinguisherControl, string>[] = [
    {
      accessorKey: 'extinguisherNumber',
      header: 'Identificación',
      cell: ({ row }) => <span className="font-medium">N° {row.original.extinguisherNumber}</span>,
    },
    {
      accessorKey: 'positionNumber',
      header: 'Ubicación',
      cell: ({ row }) => `Puesto ${row.original.positionNumber}`,
      meta: { hideOnMobile: true },
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      meta: { hideOnMobile: true },
    },
    {
      accessorKey: 'chargeExpirationDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Vencimiento
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => formatDateLocal(row.original.chargeExpirationDate),
      meta: { hideOnMobile: true },
    },
    {
      id: 'status',
      accessorFn: (row) => calculateExpirationStatus(row.chargeExpirationDate),
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
      filterFn: statusFilterFn,
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
                navigate(`${ROUTE_PATHS.FIRE_EXTINGUISHERS}/${row.original.id}/edit`);
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

  const loadExtinguishers = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    try {
      const data = await api.getFireExtinguishers(currentCompany.id);
      setExtinguishers(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar extintores');
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany]);

  useEffect(() => {
    loadExtinguishers();
  }, [loadExtinguishers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.deleteFireExtinguisher(deleteId);
      toast.success('Extintor eliminado correctamente');
      setDeleteId(null);
      loadExtinguishers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar extintor');
    } finally {
      setIsDeleting(false);
    }
  };

  const headerActions = (
    <Button onClick={() => navigate(ROUTE_PATHS.NEW_FIRE_EXTINGUISHER)}>
      <Plus className="w-4 h-4" />
      Nuevo Control
    </Button>
  );

  return (
    <PageLayout title={MODULE_TITLES.FIRE_EXTINGUISHERS} headerActions={headerActions}>
      {isLoading ? (
        <SkeletonTable />
      ) : extinguishers.length === 0 ? (
        <Empty
          icon="list"
          title="No hay controles registrados"
          action={{
            label: 'Registrar primer control',
            onClick: () => navigate(ROUTE_PATHS.NEW_FIRE_EXTINGUISHER),
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={extinguishers}
          searchKey="extinguisherNumber"
          searchPlaceholder="Buscar por N° extintor..."
          toolbar={(table) => <StatusFilter column={table.getColumn('status')} />}
          cardRenderer={(row) => {
            const expirationStatus = calculateExpirationStatus(row.chargeExpirationDate);
            return (
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between">
                  <span className="font-medium">N° {row.extinguisherNumber}</span>
                  <StatusBadge status={expirationStatus} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {row.type || '—'} · {row.positionNumber ? `Puesto ${row.positionNumber}` : '—'}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm">
                    Vence: {formatDateLocal(row.chargeExpirationDate)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`${ROUTE_PATHS.FIRE_EXTINGUISHERS}/${row.id}/edit`)}
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
            );
          }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar control de extintor?"
        message="Esta acción no se puede deshacer. El control será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};

export default FireExtinguisherListPage;
