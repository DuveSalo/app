import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, MoreHorizontal, FileText, Power, Trash2 } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PageLayout from '@/components/layout/PageLayout';
import { DataTable } from '@/components/common/DataTable';
import { SkeletonTable } from '@/components/common/SkeletonLoader';
import { SubscriptionStatusBadge } from './components/SubscriptionStatusBadge';
import { formatDateLocal } from '@/lib/utils/dateUtils';
import * as api from '@/lib/api/services';
import { queryKeys } from '@/lib/queryKeys';
import { createLogger } from '@/lib/utils/logger';
import type { AdminSchoolRow } from './types';

const logger = createLogger('AdminSchoolsPage');

const AdminSchoolsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    school: AdminSchoolRow | null;
  }>({
    open: false,
    school: null,
  });

  const { data: schools = [], isLoading } = useQuery({
    queryKey: queryKeys.adminSchools(),
    queryFn: api.getAllSchools,
  });

  const handleToggleStatus = async (school: AdminSchoolRow) => {
    const isSuspended = school.subscriptionStatus === 'suspended';
    try {
      if (isSuspended) {
        await api.activateSchool(school.id);
        toast.success(`"${school.name}" activada`);
      } else {
        await api.suspendSchool(school.id);
        toast.success(`"${school.name}" suspendida`);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSchools() });
    } catch (err) {
      logger.error('Error toggling school status', err);
      toast.error(isSuspended ? 'Error al activar la escuela' : 'Error al suspender la escuela');
    }
  };

  const handleDelete = async () => {
    const school = deleteDialog.school;
    if (!school) return;
    setDeleteDialog({ open: false, school: null });
    try {
      await api.deleteSchool(school.id);
      toast.success(`"${school.name}" eliminada`);
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSchools() });
    } catch (err) {
      logger.error('Error deleting school', err);
      toast.error('Error al eliminar la escuela');
    }
  };

  const columns: ColumnDef<AdminSchoolRow, string>[] = [
    {
      accessorKey: 'name',
      header: 'Escuela',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email || '-'}</span>,
      meta: { hideOnMobile: true },
    },
    {
      accessorKey: 'city',
      header: 'Localidad',
      cell: ({ row }) => (
        <span>{[row.original.city, row.original.province].filter(Boolean).join(', ') || '-'}</span>
      ),
      meta: { hideOnMobile: true },
    },
    {
      accessorKey: 'plan',
      header: 'Plan',
      meta: { hideOnMobile: true },
    },
    {
      accessorKey: 'subscriptionStatus',
      header: 'Estado',
      cell: ({ row }) => <SubscriptionStatusBadge status={row.original.subscriptionStatus} />,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fecha registro
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => formatDateLocal(row.original.createdAt),
      meta: { hideOnMobile: true },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const school = row.original;
        const isSuspended = school.subscriptionStatus === 'suspended';

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/admin/schools/${school.id}`)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver detalle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleStatus(school)}>
                  <Power className="mr-2 h-4 w-4" />
                  {isSuspended ? 'Activar' : 'Suspender'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteDialog({ open: true, school })}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <PageLayout title="Escuelas" showNotifications={false}>
        <SkeletonTable rows={8} />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Escuelas" showNotifications={false}>
      <DataTable
        columns={columns}
        data={schools}
        searchKey="name"
        searchPlaceholder="Buscar escuela..."
        pageSize={10}
        cardRenderer={(row) => {
          const isSuspended = row.subscriptionStatus === 'suspended';
          return (
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between">
                <span className="font-medium">{row.name}</span>
                <SubscriptionStatusBadge status={row.subscriptionStatus} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground truncate">{row.email || '—'}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm">
                  {row.city || '—'} · {row.plan || '—'}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/admin/schools/${row.id}`)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Ver detalle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(row)}>
                      <Power className="mr-2 h-4 w-4" />
                      {isSuspended ? 'Activar' : 'Suspender'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteDialog({ open: true, school: row })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        }}
      />

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) setDeleteDialog({ open: false, school: null });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar escuela</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara permanentemente a{' '}
              <span className="font-medium">{deleteDialog.school?.name}</span> y todos sus datos
              asociados. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default AdminSchoolsPage;
