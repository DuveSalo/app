import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';

interface RejectPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const RejectPaymentDialog = ({ open, onClose, onConfirm }: RejectPaymentDialogProps) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rechazar pago</AlertDialogTitle>
          <AlertDialogDescription>
            Indicá el motivo del rechazo. El usuario recibirá una notificación con esta información.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          placeholder="Motivo del rechazo..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!reason.trim()}
            variant="destructive"
          >
            Rechazar pago
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
