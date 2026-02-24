import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { CheckIcon } from '../../../components/common/Icons';
import { plansData, mpPlansData } from '../../auth/SubscriptionPage';
import type { Subscription } from '../../../types/subscription';
import type { Plan } from '../../../types/index';

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

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getPlanPrice(plan: Plan, provider: string): { display: string; amount: number; currency: string } {
  if (provider === 'mercadopago') {
    const mp = mpPlansData[plan.id];
    return { display: mp?.priceArs ?? '', amount: mp?.priceNumberArs ?? 0, currency: 'ARS' };
  }
  return { display: plan.price + plan.priceSuffix, amount: plan.priceNumber ?? 0, currency: 'USD' };
}

export const ChangePlanModal: React.FC<ChangePlanModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onConfirm,
}) => {
  const [selectedPlanKey, setSelectedPlanKey] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const currentPlan = plansData.find((p) => p.id === subscription.planKey);
  const newPlan = plansData.find((p) => p.id === selectedPlanKey);
  const provider = subscription.paymentProvider;

  const currentPrice = currentPlan ? getPlanPrice(currentPlan, provider) : null;
  const newPrice = newPlan ? getPlanPrice(newPlan, provider) : null;

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
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Plan actual</p>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-900">{currentPlan?.name ?? subscription.planName}</p>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                {currentPlan?.features.map((f, i) => (
                  <span key={i} className="text-xs text-gray-500 flex items-center gap-0.5">
                    <CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-sm font-semibold text-gray-900">
                {currentPrice?.display ?? formatCurrency(subscription.amount, subscription.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* New plan selector */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Nuevo plan</p>
          <div className="space-y-2">
            {availablePlans.map((plan) => {
              const price = getPlanPrice(plan, provider);
              const isSelected = selectedPlanKey === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => { setSelectedPlanKey(plan.id); setError(''); }}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-gray-900 ring-1 ring-gray-900 bg-white'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                      {plan.tag && (
                        <span className="text-xs font-semibold tracking-wide rounded-full bg-gray-900 text-white px-2 py-0.5">
                          {plan.tag}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                      {plan.features.map((f, i) => (
                        <span key={i} className="text-xs text-gray-500 flex items-center gap-0.5">
                          <CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-900">{price.display}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Change summary */}
        {newPlan && currentPlan && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Resumen del cambio</p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tipo de cambio</span>
              <span className={`font-medium ${isUpgrade ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isUpgrade ? 'Upgrade' : 'Downgrade'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Precio anterior</span>
              <span className="text-gray-500 line-through">{currentPrice?.display}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Nuevo precio</span>
              <span className="font-semibold text-gray-900">{newPrice?.display}</span>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Se efectua el</span>
                <span className="font-medium text-gray-900">
                  {formatDate(subscription.nextBillingTime)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
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
