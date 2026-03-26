import { Download, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ViewReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  receiptUrl: string | null;
  isLoading: boolean;
}

export const ViewReceiptDialog = ({
  open,
  onClose,
  receiptUrl,
  isLoading,
}: ViewReceiptDialogProps) => {
  const isImage = receiptUrl
    ? /\.(jpe?g|png|webp|gif)(\?|$)/i.test(receiptUrl)
    : false;
  const isPdf = receiptUrl ? /\.pdf(\?|$)/i.test(receiptUrl) : false;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comprobante de transferencia</DialogTitle>
          <DialogDescription className="sr-only">Vista del comprobante de transferencia</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[200px] items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : !receiptUrl ? (
            <p className="text-sm text-muted-foreground">No se pudo cargar el comprobante</p>
          ) : isImage ? (
            <img
              src={receiptUrl}
              alt="Comprobante de transferencia"
              className="max-h-[60vh] rounded-lg object-contain"
            />
          ) : isPdf ? (
            <iframe
              src={receiptUrl}
              title="Comprobante de transferencia"
              className="h-[60vh] w-full rounded-lg border"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Formato no soportado. Descargá el archivo para verlo.
            </p>
          )}
        </div>

        <DialogFooter>
          {receiptUrl && (
            <Button variant="ghost" onClick={() => window.open(receiptUrl, '_blank')}>
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          )}
          <Button variant="default" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
