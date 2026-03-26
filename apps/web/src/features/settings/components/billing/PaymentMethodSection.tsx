import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CARD_BRANDS } from './billingConstants';
import { ChangeCardForm } from './ChangeCardForm';

interface PaymentMethodSectionProps {
  canChangePlan: boolean;
  cardBrand?: string | null;
  cardLastFour?: string | null;
  mpPreapprovalId?: string | null;
  onChangeCard: (cardTokenId: string) => Promise<void>;
}

export const PaymentMethodSection = ({
  canChangePlan,
  cardBrand,
  cardLastFour,
  mpPreapprovalId,
  onChangeCard,
}: PaymentMethodSectionProps) => {
  const [showChangeCardDialog, setShowChangeCardDialog] = useState(false);

  const handleTokenReady = async (cardTokenId: string) => {
    await onChangeCard(cardTokenId);
    setShowChangeCardDialog(false);
  };

  const brandLabel = cardBrand ? CARD_BRANDS[cardBrand] || cardBrand : 'Tarjeta de crédito/débito';

  return (
    <div className="border-t border-border pt-5 mt-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-foreground">Método de pago</h3>
        {canChangePlan && mpPreapprovalId && (
          <Button type="button" variant="ghost" onClick={() => setShowChangeCardDialog(true)}>
            Cambiar
          </Button>
        )}
      </div>

      {/* Current payment method display */}
      <div className="flex items-center gap-4">
        {/* Mini card visual */}
        <div className="w-[72px] h-[46px] rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-950 p-2 flex flex-col justify-between flex-shrink-0">
          <div className="w-5 h-3.5 rounded-sm bg-gradient-to-br from-amber-300 to-amber-500 opacity-80" />
          <p className="text-xs tracking-widest text-muted-foreground font-mono">
            {cardLastFour ? `.... ${cardLastFour}` : '.... ....'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {brandLabel}
            {cardLastFour && (
              <span className="text-muted-foreground font-normal">
                {' '}
                terminada en {cardLastFour}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">MercadoPago</p>
        </div>
      </div>

      {/* Change card dialog */}
      <Dialog open={showChangeCardDialog} onOpenChange={setShowChangeCardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar tarjeta</DialogTitle>
            <DialogDescription>
              Ingresá los datos de tu nueva tarjeta de crédito o débito.
            </DialogDescription>
          </DialogHeader>
          <ChangeCardForm
            onTokenReady={handleTokenReady}
            onCancel={() => setShowChangeCardDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
