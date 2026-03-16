import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { ColorBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { formatDateLocal } from '@/lib/utils/dateUtils';
import { AdminPdfViewerModal } from './AdminPdfViewerModal';
import * as api from '@/lib/api/services';
import { toast } from 'sonner';
import type { AdminDocumentModule } from '../types';
import type {
  EventInformation,
  QRDocument,
} from '@/types/index';

interface AdminDocumentTableProps {
  module: AdminDocumentModule;
  data: unknown[];
  companyId: string;
  onRefresh: () => void;
}

// Status badge for expiration
const ExpirationBadge = ({ date }: { date: string | undefined }) => {
  if (!date) return <span className="text-sm text-muted-foreground">-</span>;
  const isExpired = new Date(date) < new Date();
  return <ColorBadge variant={isExpired ? 'red' : 'emerald'} label={isExpired ? 'Vencido' : 'Vigente'} />;
};

export const AdminDocumentTable = ({
  module,
  data,
  companyId,
  onRefresh,
}: AdminDocumentTableProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleViewPdf = async (bucket: string, path: string | undefined) => {
    if (!path) return;
    try {
      const url = await api.getAdminSignedUrl(bucket, path);
      setPdfUrl(url);
      setPdfModalOpen(true);
    } catch {
      toast.error('Error al obtener el documento');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.adminDeleteDocument(module, deleteId);
      toast.success('Documento eliminado');
      onRefresh();
    } catch {
      toast.error('Error al eliminar el documento');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const ActionsCell = ({
    id,
    bucket,
    pdfPath,
  }: {
    id: string;
    bucket?: string;
    pdfPath?: string;
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {bucket && pdfPath && (
          <DropdownMenuItem onClick={() => handleViewPdf(bucket, pdfPath)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver PDF
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => setDeleteId(id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo((): ColumnDef<any, any>[] => {
    switch (module) {
      case 'fire_extinguishers':
        return [
          { accessorKey: 'extinguisherNumber', header: 'N°' },
          { accessorKey: 'positionNumber', header: 'Ubicación' },
          { accessorKey: 'type', header: 'Tipo' },
          {
            accessorKey: 'chargeExpirationDate',
            header: 'Venc. Carga',
            cell: ({ row }) => formatDateLocal(row.original.chargeExpirationDate),
          },
          {
            id: 'status',
            header: 'Estado',
            cell: ({ row }) => (
              <ExpirationBadge date={row.original.chargeExpirationDate} />
            ),
          },
          {
            id: 'actions',
            header: '',
            cell: ({ row }) => <ActionsCell id={row.original.id} />,
          },
        ];

      case 'conservation_certificates':
        return [
          { accessorKey: 'intervener', header: 'Interviniente' },
          { accessorKey: 'registrationNumber', header: 'N° Matrícula' },
          {
            accessorKey: 'expirationDate',
            header: 'Vencimiento',
            cell: ({ row }) => formatDateLocal(row.original.expirationDate),
          },
          {
            id: 'status',
            header: 'Estado',
            cell: ({ row }) => (
              <ExpirationBadge date={row.original.expirationDate} />
            ),
          },
          {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
              <ActionsCell
                id={row.original.id}
                bucket="certificates"
                pdfPath={row.original.pdfFilePath}
              />
            ),
          },
        ];

      case 'self_protection_systems':
        return [
          {
            accessorKey: 'probatoryDispositionDate',
            header: 'Fecha disposición',
            cell: ({ row }) =>
              formatDateLocal(row.original.probatoryDispositionDate),
          },
          {
            accessorKey: 'expirationDate',
            header: 'Vencimiento',
            cell: ({ row }) => formatDateLocal(row.original.expirationDate),
          },
          {
            id: 'status',
            header: 'Estado',
            cell: ({ row }) => (
              <ExpirationBadge date={row.original.expirationDate} />
            ),
          },
          {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
              <ActionsCell
                id={row.original.id}
                bucket="self-protection-systems"
                pdfPath={row.original.probatoryDispositionPdfPath}
              />
            ),
          },
        ];

      case 'qr_documents':
        return [
          { accessorKey: 'documentName', header: 'Nombre' },
          {
            id: 'location',
            header: 'Piso/Unidad',
            cell: ({ row }) => {
              const qr = row.original as QRDocument;
              return [qr.floor, qr.unit].filter(Boolean).join(' / ') || '-';
            },
          },
          {
            accessorKey: 'uploadDate',
            header: 'Fecha',
            cell: ({ row }) => formatDateLocal(row.original.uploadDate),
          },
          {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
              <ActionsCell
                id={row.original.id}
                bucket="qr-documents"
                pdfPath={row.original.pdfFilePath}
              />
            ),
          },
        ];

      case 'events':
        return [
          {
            accessorKey: 'description',
            header: 'Descripción',
            cell: ({ row }) => {
              const desc = (row.original as EventInformation).description;
              return desc.length > 60 ? desc.slice(0, 60) + '...' : desc;
            },
          },
          {
            accessorKey: 'date',
            header: 'Fecha',
            cell: ({ row }) => formatDateLocal(row.original.date),
          },
          { accessorKey: 'time', header: 'Hora' },
          {
            id: 'actions',
            header: '',
            cell: ({ row }) => <ActionsCell id={row.original.id} />,
          },
        ];
    }
  }, [module]);

  return (
    <>
      <DataTable columns={columns} data={data as any[]} pageSize={5} />

      <AdminPdfViewerModal
        open={pdfModalOpen}
        onOpenChange={setPdfModalOpen}
        url={pdfUrl}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El documento será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
