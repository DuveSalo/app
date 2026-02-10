import React from 'react';
import type { PaymentTransaction } from '../../../lib/api/services/subscription';
import { plansData } from '../../auth/SubscriptionPage';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { formatDateLocal } from '../../../lib/utils/dateUtils';
import type { Company } from '../../../types/index';

interface BillingSectionProps {
  currentCompany: Company;
  paymentHistory: PaymentTransaction[];
  isLoadingPayments: boolean;
  setBillingAction: (action: 'change' | 'cancel' | 'pause') => void;
  setShowBillingModal: (v: boolean) => void;
}

export const BillingSection: React.FC<BillingSectionProps> = ({
  currentCompany,
  paymentHistory,
  isLoadingPayments,
  setBillingAction,
  setShowBillingModal,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-base font-semibold text-gray-900">Facturacion</h2>
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Plan actual</h3>
          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${
            currentCompany.subscriptionStatus === 'canceled' ? 'bg-red-50 text-red-700' :
            currentCompany.subscriptionStatus === 'paused' ? 'bg-amber-50 text-amber-700' :
            currentCompany.subscriptionStatus === 'active' || currentCompany.subscriptionStatus === 'authorized' ? 'bg-emerald-50 text-emerald-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {currentCompany.subscriptionStatus === 'canceled' ? 'Cancelado' :
             currentCompany.subscriptionStatus === 'paused' ? 'Pausado' :
             currentCompany.subscriptionStatus === 'active' || currentCompany.subscriptionStatus === 'authorized' ? 'Activo' :
             currentCompany.subscriptionStatus === 'pending' ? 'Pendiente' :
             currentCompany.subscriptionStatus || 'Sin suscripcion'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Plan {plansData.find(p => p.id === currentCompany.selectedPlan)?.name || currentCompany.selectedPlan} - {plansData.find(p => p.id === currentCompany.selectedPlan)?.price}/mes
        </p>
        {currentCompany.subscriptionStatus !== 'canceled' && currentCompany.subscriptionRenewalDate && (
          <p className="text-sm text-gray-500 mt-1">
            Proxima facturacion: {formatDateLocal(currentCompany.subscriptionRenewalDate)}
          </p>
        )}
      </Card>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {currentCompany.subscriptionStatus !== 'canceled' && (
          <Button variant="outline" onClick={() => { setBillingAction('change'); setShowBillingModal(true); }} className="w-full sm:w-auto">Cambiar plan</Button>
        )}
        {(currentCompany.subscriptionStatus === 'active' || currentCompany.subscriptionStatus === 'authorized') && (
          <Button variant="outline" onClick={() => { setBillingAction('pause'); setShowBillingModal(true); }} className="w-full sm:w-auto">Pausar suscripcion</Button>
        )}
        {currentCompany.subscriptionStatus !== 'canceled' && (
          <Button variant="danger" onClick={() => { setBillingAction('cancel'); setShowBillingModal(true); }} className="w-full sm:w-auto">Cancelar suscripcion</Button>
        )}
      </div>

      {/* Payment History */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Historial de pagos</h3>
        {isLoadingPayments ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : paymentHistory.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-500 text-center py-4">No hay pagos registrados aun.</p>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Metodo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paymentHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDateLocal(tx.dateCreated)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">${Number(tx.amount).toLocaleString('es-AR')}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${
                          tx.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                          tx.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                          tx.status === 'rejected' ? 'bg-red-50 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {tx.status === 'approved' ? 'Aprobado' :
                           tx.status === 'pending' ? 'Pendiente' :
                           tx.status === 'rejected' ? 'Rechazado' :
                           tx.status === 'refunded' ? 'Reembolsado' :
                           tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{tx.paymentMethod || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {paymentHistory.map((tx) => (
                <div key={tx.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{formatDateLocal(tx.dateCreated)}</span>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${
                      tx.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                      tx.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                      tx.status === 'rejected' ? 'bg-red-50 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tx.status === 'approved' ? 'Aprobado' :
                       tx.status === 'pending' ? 'Pendiente' :
                       tx.status === 'rejected' ? 'Rechazado' :
                       tx.status === 'refunded' ? 'Reembolsado' :
                       tx.status}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">${Number(tx.amount).toLocaleString('es-AR')}</p>
                  {tx.paymentMethod && <p className="text-sm text-gray-500 mt-1">{tx.paymentMethod}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
