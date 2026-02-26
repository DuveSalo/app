import { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { CheckIcon } from '../../../components/common/Icons';
import { plansData } from '../../auth/SubscriptionPage';
import type { Subscription } from '../../../types/subscription';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
  onConfirm: (newPlanKey: string) => Promise<void>;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatCurrency(amount: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const ChangePlanModal = ({
  isOpen,
  onClose,
  subscription,
  onConfirm,
}: ChangePlanModalProps) => {
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Cambiar plan" size="md">
      <div className="space-y-5">
        {/* Current plan */}
        <div>
          <p className="text-sm font-medium text-neutral-900 mb-2">Plan actual</p>
          <div className="flex items-center justify-between p-3 rounded-md bg-neutral-100 border border-neutral-200">
            <div>
              <p className="text-sm font-medium text-neutral-900">{currentPlan?.name ?? subscription.planName}</p>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                {currentPlan?.features.map((f, i) => (
                  <span key={i} className="text-xs text-neutral-500 flex items-center gap-0.5">
                    <CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-sm font-medium text-neutral-900">
                {currentPrice?.display ?? formatCurrency(subscription.amount, subscription.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* New plan selector */}
        <div>
          <p className="text-sm font-medium text-neutral-900 mb-2">Nuevo plan</p>
          <div className="space-y-2">
            {availablePlans.map((plan) => {
              const isSelected = selectedPlanKey === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => { setSelectedPlanKey(plan.id); setError(''); }}
                  className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-neutral-900 ring-1 ring-neutral-900 bg-white'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-neutral-900 bg-neutral-900' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900">{plan.name}</span>
                      {plan.tag && (
                        <span className="text-xs font-medium rounded-md bg-neutral-900 text-white px-2 py-0.5">
                          {plan.tag}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                      {plan.features.map((f, i) => (
                        <span key={i} className="text-xs text-neutral-500 flex items-center gap-0.5">
                          <CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-medium text-neutral-900">{plan.price}{plan.priceSuffix}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Change summary */}
        {newPlan && currentPlan && (
          <div className="rounded-md border border-neutral-200 bg-neutral-100 p-4 space-y-3">
            <p className="text-sm font-medium text-neutral-900">Resumen del cambio</p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Tipo de cambio</span>
              <span className={`font-medium ${isUpgrade ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isUpgrade ? 'Upgrade' : 'Downgrade'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Precio anterior</span>
              <span className="text-neutral-500 line-through">{currentPrice?.display}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Nuevo precio</span>
              <span className="font-medium text-neutral-900">{newPrice?.display}</span>
            </div>

            <div className="pt-2 border-t border-neutral-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Se efectua el</span>
                <span className="font-medium text-neutral-900">
                  {formatDate(subscription.nextBillingTime)}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                El cambio se aplicara en tu proximo ciclo de facturacion. Hasta entonces, mantendras tu plan actual.
              </p>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            loading={isProcessing}
            disabled={!selectedPlanKey || isProcessing}
          >
            Confirmar cambio
          </Button>
        </div>
      </div>
    </Modal>
  );
};
