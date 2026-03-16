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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckIcon, ReceiptIcon, XCircleIcon } from '../../../components/common/Icons';
import { CardForm } from '../../auth/components/CardForm';
import { usePlans } from '../../../lib/hooks/usePlans';
import { ChangePlanModal } from './ChangePlanModal';
import * as api from '../../../lib/api/services';
import { toast } from 'sonner';
import { formatDateLocal, formatCurrency } from '../../../lib/utils/dateUtils';
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
  active: { label: 'Activa', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  approval_pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  suspended: { label: 'Suspendida', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-700 border-red-200' },
  expired: { label: 'Expirada', className: 'bg-muted text-muted-foreground border-border' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  completed: { label: 'Completado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  refunded: { label: 'Reembolsado', className: 'bg-info/10 text-info border-info/30' },
  failed: { label: 'Fallido', className: 'bg-red-50 text-red-700 border-red-200' },
};

const formatDate = (dateStr: string | null) =>
  formatDateLocal(dateStr, { day: '2-digit', month: '2-digit', year: 'numeric' });

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
  const { plans: plansData } = usePlans();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(plansData[0]?.id || 'basic');
  const [planError, setPlanError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChangePaymentDialog, setShowChangePaymentDialog] = useState(false);

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
      <div className="space-y-2 mb-4">
        {plansData.map((plan) => (
          <div
            key={plan.id}
            onClick={() => { setSelectedPlanId(plan.id); setPlanError(''); }}
            className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
              selectedPlanId === plan.id
                ? 'border-primary ring-1 ring-primary bg-background'
                : 'border-border hover:border-border bg-background'
            }`}
          >
            {/* Radio */}
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selectedPlanId === plan.id ? 'border-primary bg-primary' : 'border-border'
            }`}>
              {selectedPlanId === plan.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-background" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{plan.name}</span>
                {plan.tag && (
                  <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-md">
                    {plan.tag}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                {plan.features.map((f, i) => (
                  <span key={i} className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
              <span className="text-lg font-bold text-foreground">{plan.price}</span>
              <span className="text-xs text-muted-foreground">{plan.priceSuffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Form */}
      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-border border-t-neutral-900 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Procesando suscripcion...</p>
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
        )}
      </div>

      {planError && <p className="text-sm text-destructive text-center mt-3">{planError}</p>}
    </>
  );

  return (
    <div className="space-y-5">

      {/* Trial info card */}
      {!subscription && trialEndsAt && (
        <div className="pb-5">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-info">Periodo de prueba</h3>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-info/10 text-info">
              Activo
            </span>
          </div>
          <p className="text-sm text-info">
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
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium text-foreground">Plan</h3>
            {statusConfig && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
            )}
          </div>
          {canChangePlan && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowChangePlanModal(true)}
            >
              Cambiar plan
            </Button>
          )}
        </div>

        {/* Current plan info */}
        {subscription && !needsSubscription && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Plan</p>
                <p className="text-sm font-medium text-foreground">{subscription.planName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Precio mensual</p>
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(subscription.amount, subscription.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Proximo cobro</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(subscription.nextBillingTime)}
                </p>
              </div>
            </div>

            {subscription.activatedAt && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Suscripcion activa desde {formatDate(subscription.activatedAt)}
                </p>
              </div>
            )}
          </>
        )}

        {/* Plan selector (new subscription only) */}
        {showPlanSelection && needsSubscription && (
          <div>
            <p className="text-xs text-muted-foreground mb-3">Selecciona un plan para suscribirte</p>
            {renderPlanSelector()}
          </div>
        )}

        {/* No subscription message */}
        {!subscription && !showPlanSelection && (
          <p className="text-sm text-muted-foreground">No tienes un plan activo.</p>
        )}
      </div>

      {/* SECTION 2: Payment method */}
      {subscription && !needsSubscription && (
        <div className="border-t border-border pt-5 mt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-foreground">Método de pago</h3>
            {canChangePlan && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowChangePaymentDialog(true)}
              >
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
                {cardBrand ? (CARD_BRANDS[cardBrand] || cardBrand) : 'Tarjeta de crédito/débito'}
              </p>
              <p className="text-xs text-muted-foreground">MercadoPago</p>
            </div>
          </div>
        </div>
      )}

      {/* Change payment method Dialog */}
      <Dialog open={showChangePaymentDialog} onOpenChange={setShowChangePaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar método de pago</DialogTitle>
            <DialogDescription>
              Serás redirigido a MercadoPago para actualizar tu método de pago.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setShowChangePaymentDialog(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                window.open('https://www.mercadopago.com.ar/subscriptions', '_blank');
                setShowChangePaymentDialog(false);
              }}
            >
              Ir a MercadoPago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SECTION 3: Payment history */}
      {payments.length > 0 && (
        <div className="border-t border-border pt-5 mt-5">
          <div className="flex items-center gap-2 mb-4">
            <ReceiptIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-base font-medium text-foreground">Historial de pagos</h3>
          </div>
          <div className="space-y-3">
            {payments.map((payment) => {
              const paymentStatus = PAYMENT_STATUS_CONFIG[payment.status] || PAYMENT_STATUS_CONFIG.pending;
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm text-foreground">
                      {formatCurrency(payment.grossAmount, payment.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.paidAt)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${paymentStatus.className}`}>
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
                  <> ({formatDate(subscription.nextBillingTime)})</>
                )}. Despues de eso, perderas acceso a las funcionalidades del plan.
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
                <> Acceso disponible hasta {formatDate(subscription.nextBillingTime)}.</>
              )}
            </p>
          )}
        </div>
      )}

      {/* Cancel subscription AlertDialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={(open) => !open && setShowCancelConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar suscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Al cancelar, mantendrás acceso hasta el final del periodo de facturación actual
              {subscription?.nextBillingTime && (
                <> ({formatDate(subscription.nextBillingTime)})</>
              )}. Después de eso, perderás acceso a las funcionalidades del plan.
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
