import { useState } from 'react';
import { Button } from '../../../components/common/Button';
import { CheckIcon, ReceiptIcon, XCircleIcon } from '../../../components/common/Icons';
import { plansData } from '../../auth/SubscriptionPage';
import { CardForm } from '../../auth/components/CardForm';
import { ChangePlanModal } from './ChangePlanModal';
import * as api from '../../../lib/api/services';
import type { Subscription, PaymentTransaction } from '../../../types/subscription';

interface BillingSectionProps {
  companyId: string;
  subscription: Subscription | null;
  payments: PaymentTransaction[];
  isLoading: boolean;
  onCancel: () => Promise<void>;
  onReactivate: () => Promise<void>;
  onSubscriptionChange: () => Promise<void>;
  onChangePlan: (newPlanKey: string) => Promise<void>;
  onCreateSubscription: (data: { planKey: string; cardTokenId: string; payerEmail: string }) => Promise<void>;
  userEmail?: string;
  trialEndsAt?: string;
  cardBrand?: string | null;
  cardLastFour?: string | null;
}

const CARD_BRANDS: Record<string, string> = {
  visa: 'Visa',
  master: 'Mastercard',
  amex: 'American Express',
  naranja: 'Naranja',
  cabal: 'Cabal',
  maestro: 'Maestro',
  debvisa: 'Visa Debito',
  debmaster: 'Mastercard Debito',
  argencard: 'Argencard',
  cencosud: 'Cencosud',
  diners: 'Diners Club',
  tarshop: 'Tarjeta Shopping',
  cmr: 'CMR Falabella',
  cordial: 'Cordial',
  cordobesa: 'Cordobesa',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'Activa', className: 'bg-emerald-50 text-emerald-700' },
  approval_pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700' },
  pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700' },
  suspended: { label: 'Suspendida', className: 'bg-amber-50 text-amber-700' },
  cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-700' },
  expired: { label: 'Expirada', className: 'bg-gray-100 text-neutral-600' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  completed: { label: 'Completado', className: 'text-emerald-600' },
  pending: { label: 'Pendiente', className: 'text-amber-600' },
  refunded: { label: 'Reembolsado', className: 'text-blue-600' },
  failed: { label: 'Fallido', className: 'text-red-600' },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
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

export const BillingSection = ({
  companyId,
  subscription,
  payments,
  isLoading,
  onCancel,
  onReactivate,
  onSubscriptionChange,
  onChangePlan,
  onCreateSubscription,
  userEmail,
  trialEndsAt,
  cardBrand,
  cardLastFour,
}: BillingSectionProps) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(plansData[1].id);
  const [planError, setPlanError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChangePayment, setShowChangePayment] = useState(false);
  const [changePaymentError, setChangePaymentError] = useState('');

  const needsSubscription = !subscription || subscription.status === 'cancelled' || subscription.status === 'expired';
  const canChangePlan = subscription?.status === 'active';
  const statusConfig = subscription ? (STATUS_CONFIG[subscription.status] || STATUS_CONFIG.pending) : null;

  // Auto-show plan selection when no active subscription
  if (needsSubscription && !showPlanSelection) {
    setShowPlanSelection(true);
  }

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

  // Plan selector (for new subscriptions only)
  const renderPlanSelector = () => (
    <>
      {/* Plan cards */}
      <div className="space-y-2 mb-5">
        {plansData.map((plan) => (
          <div
            key={plan.id}
            onClick={() => { setSelectedPlanId(plan.id); setPlanError(''); }}
            className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
              selectedPlanId === plan.id
                ? 'border-neutral-900 ring-1 ring-neutral-900 bg-white'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            {/* Radio */}
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selectedPlanId === plan.id ? 'border-neutral-900 bg-neutral-900' : 'border-gray-300'
            }`}>
              {selectedPlanId === plan.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>

            {/* Info */}
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

            {/* Price */}
            <div className="text-right flex-shrink-0">
              <span className="text-lg font-bold text-neutral-900">{plan.price}</span>
              <span className="text-xs text-neutral-500">{plan.priceSuffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Form */}
      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 rounded-md">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Procesando suscripcion...</p>
            </div>
          </div>
        )}

        {needsSubscription && (
          <CardForm
            key={selectedPlanId}
            amount={plansData.find((p) => p.id === selectedPlanId)?.priceNumber || 0}
            onTokenReady={async (data) => {
              setPlanError('');
              setIsProcessing(true);
              try {
                await onCreateSubscription({
                  planKey: selectedPlanId,
                  cardTokenId: data.token,
                  payerEmail: data.email || userEmail || '',
                });
                setShowPlanSelection(false);
              } catch (err) {
                console.error('[MP] BillingSection: Create subscription error:', err);
                setPlanError('Error al crear la suscripcion. Intente nuevamente.');
              } finally {
                setIsProcessing(false);
              }
            }}
            onError={(msg) => setPlanError(msg)}
            isProcessing={isProcessing}
          />
        )}
      </div>

      {planError && <p className="text-sm text-red-600 text-center mt-3">{planError}</p>}
    </>
  );

  return (
    <div className="space-y-6">

      {/* Trial info card */}
      {!subscription && trialEndsAt && (
        <div className="bg-blue-50 rounded-md border border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-blue-900">Periodo de prueba</h3>
            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-100 text-blue-700">
              Activo
            </span>
          </div>
          <p className="text-sm text-blue-700">
            Tu prueba gratuita finaliza el{' '}
            <span className="font-medium">
              {new Date(trialEndsAt).toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
              })}
            </span>.
            Suscribite a un plan antes de esa fecha para mantener el acceso.
          </p>
        </div>
      )}

      {/* SECTION 1: Plan */}
      <div className="bg-white rounded-md border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-neutral-900">Plan</h3>
            {statusConfig && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
            )}
          </div>
          {canChangePlan && (
            <button
              type="button"
              onClick={() => setShowChangePlanModal(true)}
              className="text-sm font-medium text-neutral-900 hover:text-neutral-700 transition-colors"
            >
              Cambiar plan
            </button>
          )}
        </div>

        {/* Current plan info */}
        {subscription && !needsSubscription && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Plan</p>
                <p className="text-sm font-medium text-neutral-900">{subscription.planName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Precio mensual</p>
                <p className="text-sm font-medium text-neutral-900">
                  {formatCurrency(subscription.amount, subscription.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Proximo cobro</p>
                <p className="text-sm font-medium text-neutral-900">
                  {formatDate(subscription.nextBillingTime)}
                </p>
              </div>
            </div>

            {subscription.activatedAt && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-500">
                  Suscripcion activa desde {formatDate(subscription.activatedAt)}
                </p>
              </div>
            )}
          </>
        )}

        {/* Plan selector (new subscription only) */}
        {showPlanSelection && needsSubscription && (
          <div>
            <p className="text-xs text-neutral-500 mb-3">Selecciona un plan para suscribirte</p>
            {renderPlanSelector()}
          </div>
        )}

        {/* No subscription message */}
        {!subscription && !showPlanSelection && (
          <p className="text-sm text-neutral-500">No tienes un plan activo.</p>
        )}
      </div>

      {/* SECTION 2: Payment method */}
      {subscription && !needsSubscription && (
        <div className="bg-white rounded-md border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-900">Metodo de pago</h3>
            {canChangePlan && (
              <button
                type="button"
                onClick={() => {
                  setShowChangePayment(!showChangePayment);
                  setChangePaymentError('');
                }}
                className="text-sm font-medium text-neutral-900 hover:text-neutral-700 transition-colors"
              >
                {showChangePayment ? 'Cancelar' : 'Cambiar'}
              </button>
            )}
          </div>

          {/* Current payment method display */}
          {!showChangePayment && (
            <div className="flex items-center gap-4">
              {/* Mini card visual */}
              <div className="w-[72px] h-[46px] rounded-md bg-gradient-to-br from-gray-800 to-gray-950 p-2 flex flex-col justify-between flex-shrink-0">
                <div className="w-5 h-3.5 rounded-sm bg-gradient-to-br from-amber-300 to-amber-500 opacity-80" />
                <p className="text-xs tracking-widest text-gray-400 font-mono">
                  {cardLastFour ? `.... ${cardLastFour}` : '.... ....'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {cardBrand ? (CARD_BRANDS[cardBrand] || cardBrand) : 'Tarjeta de credito/debito'}
                </p>
                <p className="text-xs text-neutral-500">MercadoPago</p>
              </div>
            </div>
          )}

          {/* Change payment method */}
          {showChangePayment && (
            <div>
              <CardForm
                amount={subscription.amount}
                compact
                submitLabel="Actualizar tarjeta"
                onTokenReady={async (data) => {
                  setIsProcessing(true);
                  setChangePaymentError('');
                  try {
                    await api.mpManageSubscription({
                      action: 'change_card',
                      mpPreapprovalId: subscription!.mpPreapprovalId!,
                      cardTokenId: data.token,
                    });
                    setShowChangePayment(false);
                    await onSubscriptionChange();
                  } catch (err) {
                    console.error('[MP] Change card error:', err);
                    setChangePaymentError('Error al actualizar la tarjeta. Intente nuevamente.');
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                onError={(msg) => setChangePaymentError(msg)}
                isProcessing={isProcessing}
              />

              {changePaymentError && (
                <p className="text-sm text-red-600 text-center mt-3">{changePaymentError}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Payment history */}
      {payments.length > 0 && (
        <div className="bg-white rounded-md border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ReceiptIcon className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-neutral-900">Historial de pagos</h3>
          </div>
          <div className="space-y-3">
            {payments.map((payment) => {
              const paymentStatus = PAYMENT_STATUS_CONFIG[payment.status] || PAYMENT_STATUS_CONFIG.pending;
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0"
                >
                  <div>
                    <p className="text-sm text-neutral-900">
                      {formatCurrency(payment.grossAmount, payment.currency)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDate(payment.paidAt)}
                    </p>
                  </div>
                  <span className={`text-xs font-medium ${paymentStatus.className}`}>
                    {paymentStatus.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: Cancel plan */}
      {subscription && !needsSubscription && (
        <div className="bg-white rounded-md border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircleIcon className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-neutral-900">Cancelar plan</h3>
          </div>

          {subscription.status === 'active' && (
            <>
              <p className="text-sm text-neutral-500 mb-4">
                Al cancelar, mantendras acceso hasta el final del periodo de facturacion actual
                {subscription.nextBillingTime && (
                  <> ({formatDate(subscription.nextBillingTime)})</>
                )}. Despues de eso, perderas acceso a las funcionalidades del plan.
              </p>

              {!showCancelConfirm ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isLoading || actionLoading}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancelar suscripcion
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-red-600">Confirmar cancelacion?</p>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleCancel}
                    loading={actionLoading}
                    disabled={isLoading}
                  >
                    Si, cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={actionLoading}
                  >
                    No
                  </Button>
                </div>
              )}
            </>
          )}

          {subscription.status === 'suspended' && (
            <>
              <p className="text-sm text-neutral-500 mb-4">
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
            <p className="text-sm text-neutral-500">
              Suscripcion cancelada.
              {subscription.nextBillingTime && (
                <> Acceso disponible hasta {formatDate(subscription.nextBillingTime)}.</>
              )}
            </p>
          )}
        </div>
      )}

      {/* Change Plan Modal */}
      {subscription && canChangePlan && (
        <ChangePlanModal
          isOpen={showChangePlanModal}
          onClose={() => setShowChangePlanModal(false)}
          subscription={subscription}
          onConfirm={onChangePlan}
        />
      )}
    </div>
  );
};
