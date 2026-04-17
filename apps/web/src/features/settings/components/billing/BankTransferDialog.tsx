import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { FileUpload } from '@/components/common/FileUpload';
import { BankDetailsCard } from '@/features/auth/components/BankDetailsCard';
import { Upload, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Plan } from '@/types/company';

export type BankTransferStep = 'details' | 'upload' | 'status';
export type BankPaymentStatus = 'pending' | 'approved' | 'rejected';

interface BankTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: BankTransferStep;
  selectedPlan: Plan | undefined;
  isProcessing: boolean;
  uploadFile: File | null;
  onFileSelect: (file: File | null) => void;
  paymentStatus: BankPaymentStatus | null;
  rejectionReason: string | null;
  onConfirmDetails: () => Promise<void>;
  onUploadSubmit: () => Promise<void>;
  onRetryUpload: () => void;
}

export const BankTransferDialog = ({
  open,
  onOpenChange,
  step,
  selectedPlan,
  isProcessing,
  uploadFile,
  onFileSelect,
  paymentStatus,
  rejectionReason,
  onConfirmDetails,
  onUploadSubmit,
  onRetryUpload,
}: BankTransferDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Step 1: Bank details */}
        {step === 'details' && (
          <>
            <DialogHeader>
              <DialogTitle>Transferencia bancaria</DialogTitle>
              <DialogDescription>
                {selectedPlan
                  ? `${selectedPlan.name} — ${selectedPlan.price}${selectedPlan.priceSuffix}`
                  : 'Seleccioná un plan'}
              </DialogDescription>
            </DialogHeader>
            <BankDetailsCard />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" disabled={isProcessing}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button onClick={onConfirmDetails} loading={isProcessing}>
                Confirmar
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2: Upload receipt */}
        {step === 'upload' && (
          <>
            <DialogHeader>
              <DialogTitle>Subí tu comprobante</DialogTitle>
              <DialogDescription>
                Adjuntá el comprobante de la transferencia para que podamos verificar tu pago.
              </DialogDescription>
            </DialogHeader>
            <FileUpload
              onFileSelect={onFileSelect}
              accept=".pdf,.png,.jpg,.jpeg"
              label="Comprobante de transferencia"
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                Lo subiré más tarde
              </Button>
              <Button onClick={onUploadSubmit} disabled={!uploadFile} loading={isProcessing}>
                <Upload className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3: Payment status */}
        {step === 'status' && (
          <>
            <DialogHeader>
              <DialogTitle>Estado del pago</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center space-y-4">
              {paymentStatus === 'pending' && (
                <>
                  <div className="mx-auto h-14 w-14 rounded-lg bg-amber-50 border border-amber-200/50 flex items-center justify-center">
                    <Clock className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Pago pendiente de verificación
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Recibimos tu comprobante. Te notificaremos cuando sea aprobado.
                    </p>
                  </div>
                </>
              )}
              {paymentStatus === 'approved' && (
                <>
                  <div className="mx-auto h-14 w-14 rounded-lg bg-emerald-50 border border-emerald-200/50 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">¡Pago aprobado!</p>
                    <p className="text-sm text-muted-foreground">Tu suscripción está activa.</p>
                  </div>
                </>
              )}
              {paymentStatus === 'rejected' && (
                <>
                  <div className="mx-auto h-14 w-14 rounded-lg bg-red-50 border border-red-200/50 flex items-center justify-center">
                    <XCircle className="w-7 h-7 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Pago rechazado</p>
                    {rejectionReason && (
                      <div className="rounded-lg bg-muted border border-border p-3 mt-2 text-left">
                        <p className="text-sm text-muted-foreground">{rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              {paymentStatus === 'rejected' && (
                <Button variant="ghost" onClick={onRetryUpload}>
                  Subir nuevo comprobante
                </Button>
              )}
              <Button
                variant={paymentStatus === 'approved' ? 'default' : 'ghost'}
                onClick={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
