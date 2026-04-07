import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, ArrowUpDown } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { QRDocument, QRDocumentType } from '../../types/index';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
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
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatusFilter, statusFilterFn } from '../../components/common/StatusFilter';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DataTable } from '../../components/common/DataTable';
import PageLayout from '../../components/layout/PageLayout';
import { Empty } from '../../components/common/Empty';
import { calculateExpirationStatus, formatDateLocal } from '../../lib/utils/dateUtils';
import { openSupabaseStorageDocument } from '@/lib/utils/openSupabaseStorageDocument';

interface QRModulePageProps {
  qrType: QRDocumentType;
  title: string;
  uploadPath: string;
  editPath: string;
}

type QRDocumentWithStatus = QRDocument & {
  expirationDate: string;
  status: 'valid' | 'expiring' | 'expired';
};

const QRModuleListPage = ({ qrType, title, uploadPath, editPath }: QRModulePageProps) => {
  const [documents, setDocuments] = useState<QRDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { currentCompany } = useAuth();

  const handleOpenDocument = useCallback(async (document: QRDocument) => {
    try {
      await openSupabaseStorageDocument({
        bucket: 'qr-documents',
        path: document.pdfPath,
        url: document.pdfUrl,
        title: 'Abriendo PDF',
        message: 'Preparando una vista segura del documento QR.',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al abrir el PDF');
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getQRDocuments(qrType, currentCompany.id);
      setDocuments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Error al cargar archivos de ${title}`);
    } finally {
      setIsLoading(false);
    }
  }, [qrType, title, currentCompany]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setError('');
    try {
      await api.deleteQRDocument(deleteId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteId));
      toast.success('Documento eliminado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el documento.';
      setError(message);
      toast.error('Error al eliminar', { description: message });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const docsWithStatus: QRDocumentWithStatus[] = useMemo(
    () =>
      documents.map((doc) => {
        const expiry = new Date(doc.extractedDate);
        expiry.setFullYear(expiry.getFullYear() + 1);
        const expirationDate = expiry.toISOString().split('T')[0];
        return { ...doc, expirationDate, status: calculateExpirationStatus(expirationDate) };
      }),
    [documents]
  );

  const columns: ColumnDef<QRDocumentWithStatus, string>[] = [
    {
      accessorKey: 'pdfFileName',
      header: 'Documento',
      cell: ({ row }) => <span className="font-medium">{row.original.pdfFileName}</span>,
    },
    {
      id: 'fechaCarga',
      header: 'Fecha Carga',
      cell: ({ row }) => formatDateLocal(row.original.extractedDate),
      meta: { hideOnMobile: true },
    },
    {
      id: 'vencimiento',
      accessorFn: (row) => row.expirationDate,
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
      accessorFn: (row) => row.status,
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
                navigate(editPath.replace(':id', row.original.id));
              }}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {(row.original.pdfPath || row.original.pdfUrl) && (
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

  const headerActions = (
    <Button onClick={() => navigate(uploadPath)}>
      <Plus className="w-4 h-4" />
      Subir Documento
    </Button>
  );

  return (
    <PageLayout title={title} headerActions={headerActions}>
      {error && <p className="text-sm text-destructive text-center py-2">{error}</p>}
      {isLoading ? (
        <SkeletonTable />
      ) : documents.length === 0 ? (
        <Empty
          icon="file"
          title="No hay archivos registrados"
          action={{ label: 'Subir primer documento', onClick: () => navigate(uploadPath) }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={docsWithStatus}
          searchKey="pdfFileName"
          searchPlaceholder="Buscar documento..."
          toolbar={(table) => <StatusFilter column={table.getColumn('status')} />}
          cardRenderer={(row) => (
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">{row.pdfFileName}</span>
                <StatusBadge status={row.status} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Carga: {formatDateLocal(row.extractedDate)}
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
                    <DropdownMenuItem onClick={() => navigate(editPath.replace(':id', row.id))}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    {(row.pdfPath || row.pdfUrl) && (
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
          )}
        />
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar documento?"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};

export default QRModuleListPage;
