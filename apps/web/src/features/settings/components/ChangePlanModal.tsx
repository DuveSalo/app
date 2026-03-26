import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlans } from '../../../lib/hooks/usePlans';
import { formatDateLocal, formatCurrency } from '../../../lib/utils/dateUtils';
import type { Subscription } from '../../../types/subscription';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
  onConfirm: (newPlanKey: string) => Promise<void>;
}

const formatDate = (dateStr: string | null) =>
  formatDateLocal(dateStr, { day: '2-digit', month: 'long', year: 'numeric' });

export const ChangePlanModal = ({
  isOpen,
  onClose,
  subscription,
  onConfirm,
}: ChangePlanModalProps) => {
  const { plans: plansData } = usePlans();
  const [selectedPlanKey, setSelectedPlanKey] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const currentPlan = plansData.find((p) => p.id === subscription.planKey);
  const newPlan = plansData.find((p) => p.id === selectedPlanKey);

  const currentPrice = currentPlan
    ? { display: currentPlan.price + currentPlan.priceSuffix, amount: currentPlan.priceNumber ?? 0 }
    : null;
  const newPrice = newPlan
    ? { display: newPlan.price + newPlan.priceSuffix, amount: newPlan.priceNumber ?? 0 }
    : null;

  const isUpgrade = newPlan && currentPlan
    ? (newPrice?.amount ?? 0) > (currentPrice?.amount ?? 0)
    : false;

  const handleConfirm = async () => {
    if (!selectedPlanKey) return;
    setIsProcessing(true);
    setError('');
    try {
      await onConfirm(selectedPlanKey);
      handleClose();
    } catch {
      setError('Error al cambiar de plan. Intente nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setSelectedPlanKey('');
    setError('');
    onClose();
  };

  const availablePlans = plansData.filter((p) => p.id !== subscription.planKey);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Cambiar plan</DialogTitle>
          <DialogDescription className="sr-only">Seleccioná un nuevo plan de suscripción</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6 space-y-4">
        {/* Current plan */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-2">Plan actual</p>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium">{currentPlan?.name ?? subscription.planName}</p>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                {currentPlan?.features.map((f, i) => (
                  <span key={i} className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm font-semibold flex-shrink-0 ml-4">
              {currentPrice?.display ?? formatCurrency(subscription.amount, subscription.currency)}
            </p>
          </div>
        </div>

        {/* New plan selector */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-2">Nuevo plan</p>
          <div className="space-y-3">
            {availablePlans.map((plan) => {
              const isSelected = selectedPlanKey === plan.id;
              return (
                <label
                  key={plan.id}
                  onClick={() => { setSelectedPlanKey(plan.id); setError(''); }}
                  className={cn(
                    'flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      isSelected ? 'border-primary bg-primary' : 'border-border',
                    )}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{plan.name}</span>
                        {plan.tag && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {plan.tag}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                        {plan.features.map((f, i) => (
                          <span key={i} className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0">{plan.price}{plan.priceSuffix}</p>
                </label>
              );
            })}
          </div>
        </div>

        {/* Change summary */}
        {newPlan && currentPlan && (
          <div className="border border-border bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium">Resumen del cambio</p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tipo de cambio</span>
              <span className={cn('font-medium', isUpgrade ? 'text-emerald-600' : 'text-amber-600')}>
                {isUpgrade ? 'Upgrade' : 'Downgrade'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Precio anterior</span>
              <span className="text-muted-foreground line-through">{currentPrice?.display}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Nuevo precio</span>
              <span className="font-medium">{newPrice?.display}</span>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Se efectua el</span>
                <span className="font-medium">
                  {formatDate(subscription.nextBillingTime)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                El cambio se aplicara en tu proximo ciclo de facturacion. Hasta entonces, mantendras tu plan actual.
              </p>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isProcessing}>Cancelar</Button>
          </DialogClose>
          <Button onClick={handleConfirm} loading={isProcessing} disabled={!selectedPlanKey}>
            Confirmar cambio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
