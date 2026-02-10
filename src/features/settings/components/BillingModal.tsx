import React from 'react';
import { plansData } from '../../auth/SubscriptionPage';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { Company } from '../../../types/index';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingAction: 'change' | 'cancel' | 'pause';
  currentCompany: Company;
  newSelectedPlanId: string;
  setNewSelectedPlanId: (id: string) => void;
  handleBillingAction: () => void;
  isLoading: boolean;
  error: string;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  billingAction,
  currentCompany,
  newSelectedPlanId,
  setNewSelectedPlanId,
  handleBillingAction,
  isLoading,
  error,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      billingAction === 'change' ? 'Cambiar plan' :
      billingAction === 'pause' ? 'Pausar suscripcion' :
      'Cancelar suscripcion'
    }>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          {billingAction === 'change'
            ? 'Selecciona un nuevo plan. Se cancelara tu plan actual y seras redirigido a MercadoPago para completar el pago del nuevo plan.'
            : billingAction === 'pause'
            ? 'Tu suscripcion sera pausada. No se realizaran cobros mientras este pausada, pero podras reactivarla en cualquier momento.'
            : 'Al cancelar tu suscripcion perderas el acceso a las funciones del sistema. Esta accion no se puede deshacer.'}
        </p>
        {billingAction === 'change' && (
          <div className="space-y-2">
            {plansData.filter(p => p.id !== currentCompany?.selectedPlan).map((plan) => (
              <div key={plan.id} className={`border rounded-xl p-4 cursor-pointer transition-all ${newSelectedPlanId === plan.id ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setNewSelectedPlanId(plan.id)}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.price}/mes</p>
                  </div>
                  <input type="radio" name="plan" value={plan.id} checked={newSelectedPlanId === plan.id} readOnly className="h-4 w-4 text-gray-900 focus:ring-gray-500" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <div className="flex justify-end gap-2.5 pt-4 mt-2">
          <Button variant="outline" onClick={onClose}>Volver</Button>
          <Button variant={billingAction === 'cancel' ? 'danger' : 'primary'} onClick={handleBillingAction} loading={isLoading}>
            {billingAction === 'change' ? 'Cambiar plan' :
             billingAction === 'pause' ? 'Pausar suscripcion' :
             'Confirmar cancelacion'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
