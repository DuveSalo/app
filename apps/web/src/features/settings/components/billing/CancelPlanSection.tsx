import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { XCircleIcon } from '@/components/common/Icons';
import { formatBillingDate } from './billingConstants';
import type { Subscription } from '@/types/subscription';

interface CancelPlanSectionProps {
  subscription: Subscription;
  isLoading: boolean;
  onCancel: () => Promise<void>;
  onReactivate: () => Promise<void>;
}

export const CancelPlanSection = ({
  subscription,
  isLoading,
  onCancel,
  onReactivate,
}: CancelPlanSectionProps) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await onCancel();
      setShowCancelConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      await onReactivate();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="border-t border-border pt-5 mt-5">
      <div className="flex items-center gap-2 mb-4">
        <XCircleIcon className="w-4 h-4 text-destructive" />
        <h3 className="text-base font-medium text-destructive">Cancelar plan</h3>
      </div>

      {subscription.status === 'active' && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Al cancelar, mantendras acceso hasta el final del periodo de facturacion actual
            {subscription.nextBillingTime && (
              <> ({formatBillingDate(subscription.nextBillingTime)})</>
            )}
            . Despues de eso, perderas acceso a las funcionalidades del plan.
          </p>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowCancelConfirm(true)}
            disabled={isLoading || actionLoading}
          >
            Cancelar suscripcion
          </Button>
        </>
      )}

      {subscription.status === 'suspended' && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Tu suscripcion esta suspendida. Puedes reactivarla para recuperar el acceso.
          </p>
          <Button
            type="button"
            onClick={handleReactivate}
            loading={actionLoading}
            disabled={isLoading}
          >
            Reactivar suscripcion
          </Button>
        </>
      )}

      {subscription.status === 'cancelled' && (
        <p className="text-sm text-muted-foreground">
          Suscripcion cancelada.
          {subscription.nextBillingTime && (
            <> Acceso disponible hasta {formatBillingDate(subscription.nextBillingTime)}.</>
          )}
        </p>
      )}

      {/* Cancel subscription AlertDialog */}
      <AlertDialog
        open={showCancelConfirm}
        onOpenChange={(open) => !open && setShowCancelConfirm(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar suscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Al cancelar, mantendrás acceso hasta el final del periodo de facturación actual
              {subscription.nextBillingTime && (
                <> ({formatBillingDate(subscription.nextBillingTime)})</>
              )}
              . Después de eso, perderás acceso a las funcionalidades del plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>No, mantener plan</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={actionLoading}
              variant="destructive"
            >
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
