import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, ArrowUpDown } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { ConservationCertificate } from '../../types/index';
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
import { calculateExpirationStatus, formatDateLocal } from '../../lib/utils/dateUtils';
import { Empty } from '../../components/common/Empty';
import { openSupabaseStorageDocument } from '@/lib/utils/openSupabaseStorageDocument';

const ConservationCertificateListPage = () => {
  const [certificates, setCertificates] = useState<ConservationCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentCompany } = useAuth();

  const handleOpenDocument = useCallback(async (certificate: ConservationCertificate) => {
    try {
      await openSupabaseStorageDocument({
        bucket: 'certificates',
        path: certificate.pdfFilePath,
        url: typeof certificate.pdfFile === 'string' ? certificate.pdfFile : undefined,
        title: 'Abriendo PDF',
        message: 'Preparando una vista segura del certificado.',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al abrir el PDF');
    }
  }, []);

  const columns: ColumnDef<ConservationCertificate, string>[] = [
    {
      accessorKey: 'intervener',
      header: 'Interviniente',
      cell: ({ row }) => <span className="font-medium">{row.original.intervener}</span>,
    },
    {
      accessorKey: 'registrationNumber',
      header: 'N° Certificado',
      meta: { hideOnMobile: true },
    },
    {
      accessorKey: 'expirationDate',
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
      cell: ({ row }) => formatDateLocal(row.original.expirationDate),
      meta: { hideOnMobile: true },
    },
    {
      id: 'status',
      accessorFn: (row) => calculateExpirationStatus(row.expirationDate),
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
                navigate(ROUTE_PATHS.EDIT_CONSERVATION_CERTIFICATE.replace(':id', row.original.id));
              }}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {(row.original.pdfFilePath ||
              (row.original.pdfFile && typeof row.original.pdfFile === 'string')) && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  void handleOpenDocument(row.original);
                }}
              >
                <Eye className="h-4 w-4" />
                Ver PDF
              </DropdownMenuItem>
            )}
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

  const loadCertificates = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    try {
      const data = await api.getCertificates(currentCompany.id);
      setCertificates(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar certificados');
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const prev = [...certificates];
    setCertificates((c) => c.filter((cert) => cert.id !== deleteId));
    try {
      await api.deleteCertificate(deleteId);
      toast.success('Certificado eliminado correctamente');
    } catch (err: unknown) {
      setCertificates(prev);
      toast.error(err instanceof Error ? err.message : 'Error al eliminar certificado');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const headerActions = (
    <Button onClick={() => navigate(ROUTE_PATHS.NEW_CONSERVATION_CERTIFICATE)}>
      <Plus className="w-4 h-4" />
      Nuevo certificado
    </Button>
  );

  return (
    <PageLayout title={MODULE_TITLES.CONSERVATION_CERTIFICATES} headerActions={headerActions}>
      {isLoading ? (
        <SkeletonTable />
      ) : certificates.length === 0 ? (
        <Empty
          icon="file"
          title="No hay certificados registrados"
          action={{
            label: 'Crear primer certificado',
            onClick: () => navigate(ROUTE_PATHS.NEW_CONSERVATION_CERTIFICATE),
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={certificates}
          searchKey="intervener"
          searchPlaceholder="Buscar por interviniente..."
          toolbar={(table) => <StatusFilter column={table.getColumn('status')} />}
          cardRenderer={(row) => {
            const expirationStatus = calculateExpirationStatus(row.expirationDate);
            return (
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{row.intervener}</span>
                  <StatusBadge status={expirationStatus} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  N° {row.registrationNumber || '—'}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm">Vence: {formatDateLocal(row.expirationDate)}</span>
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
                          navigate(ROUTE_PATHS.EDIT_CONSERVATION_CERTIFICATE.replace(':id', row.id))
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {(row.pdfFilePath || (row.pdfFile && typeof row.pdfFile === 'string')) && (
                        <DropdownMenuItem onClick={() => void handleOpenDocument(row)}>
                          <Eye className="h-4 w-4" />
                          Ver PDF
                        </DropdownMenuItem>
                      )}
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
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar certificado?"
        message="Esta acción no se puede deshacer. El certificado será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};

export default ConservationCertificateListPage;
