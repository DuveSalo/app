import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CardForm } from '@/features/auth/components/CardForm';
import { toast } from 'sonner';
import type { Plan } from '@/types/company';

interface CardPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: Plan | undefined;
  selectedPlanId: string;
  userEmail?: string;
  onCreateSubscription: (data: {
    planKey: string;
    cardTokenId: string;
    payerEmail: string;
    cardBrand?: string | null;
    cardLastFour?: string | null;
    paymentTypeId?: string | null;
  }) => Promise<void>;
}

export const CardPaymentDialog = ({
  open,
  onOpenChange,
  selectedPlan,
  selectedPlanId,
  userEmail,
  onCreateSubscription,
}: CardPaymentDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [planError, setPlanError] = useState('');

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isProcessing) return;
    onOpenChange(nextOpen);
    if (!nextOpen) setPlanError('');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagar con tarjeta</DialogTitle>
          <DialogDescription>
            {selectedPlan
              ? `${selectedPlan.name} — ${selectedPlan.price}${selectedPlan.priceSuffix}`
              : 'Seleccioná un plan'}
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-10 rounded-lg">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Procesando suscripción...</p>
              </div>
            </div>
          )}
          <CardForm
            key={selectedPlanId}
            amount={selectedPlan?.priceNumber || 0}
            onTokenReady={async (data) => {
              setPlanError('');
              setIsProcessing(true);
              try {
                await onCreateSubscription({
                  planKey: selectedPlanId,
                  cardTokenId: data.token,
                  payerEmail: data.email || userEmail || '',
                  cardBrand: data.paymentMethodId || null,
                  cardLastFour: data.lastFourDigits,
                  paymentTypeId: data.paymentTypeId,
                });
                onOpenChange(false);
              } catch (err) {
                console.error('[MP] CardPaymentDialog: Create subscription error:', err);
                const msg = 'Error al crear la suscripción. Intente nuevamente.';
                setPlanError(msg);
                toast.error(msg);
              } finally {
                setIsProcessing(false);
              }
            }}
            onError={(msg) => setPlanError(msg)}
            isProcessing={isProcessing}
          />
        </div>
        {planError && <p className="text-sm text-destructive text-center">{planError}</p>}
      </DialogContent>
    </Dialog>
  );
};
