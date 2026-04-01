import { useState, useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
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
  DialogClose,
} from '@/components/ui/dialog';
import {
  CheckIcon,
  CreditCardIcon,
  ReceiptIcon,
  XCircleIcon,
} from '../../../components/common/Icons';
import { Building2, Upload, Clock, CheckCircle, XCircle } from 'lucide-react';
import { FileUpload } from '@/components/common/FileUpload';
import * as api from '@/lib/api/services';
import { supabase } from '@/lib/supabase/client';
import { CardForm } from '../../auth/components/CardForm';
import { BankDetailsCard } from '../../auth/components/BankDetailsCard';
import { ChangeCardForm } from './billing/ChangeCardForm';
import { usePlans } from '../../../lib/hooks/usePlans';
import { ChangePlanModal } from './ChangePlanModal';
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
  onChangeCard: (cardTokenId: string) => Promise<void>;
  onCreateSubscription: (data: {
    planKey: string;
    cardTokenId: string;
    payerEmail: string;
  }) => Promise<void>;
  onBankTransferPayment: (data: { planKey: string; amount: number }) => Promise<void>;
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
  approval_pending: {
    label: 'Pendiente',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  suspended: { label: 'Suspendida', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-700 border-red-200' },
  expired: { label: 'Expirada', className: 'bg-muted text-muted-foreground border-border' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  completed: {
    label: 'Completado',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
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
  onChangePlan,
  onChangeCard,
  onCreateSubscription,
  onBankTransferPayment,
  onSubscriptionChange,
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
  const [showChangeCardForm, setShowChangeCardForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Bank transfer multi-step dialog state
  type BankTransferStep = 'details' | 'upload' | 'status';
  type BankPaymentStatus = 'pending' | 'approved' | 'rejected';
  const [bankTransferStep, setBankTransferStep] = useState<BankTransferStep>('details');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [bankPaymentStatus, setBankPaymentStatus] = useState<BankPaymentStatus | null>(null);
  const [bankRejectionReason, setBankRejectionReason] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const isBankTransfer = subscription?.paymentProvider === 'bank_transfer';

  const needsSubscription = !subscription || subscription.status === 'cancelled';
  const canChangePlan = subscription?.status === 'active' && !isBankTransfer;
  const statusConfig = subscription
    ? STATUS_CONFIG[subscription.status] || STATUS_CONFIG.pending
    : null;

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

  const selectedPlan = plansData.find((p) => p.id === selectedPlanId);

  const handleOpenPaymentDialog = () => {
    setPlanError('');
    setShowPaymentDialog(true);
  };

  const handleClosePaymentDialog = (open: boolean) => {
    if (!open && isProcessing) return;
    setShowPaymentDialog(open);
    if (!open) {
      setBankTransferStep('details');
      setUploadFile(null);
      setBankPaymentStatus(null);
      setBankRejectionReason(null);
    }
  };

  const handleBankTransferConfirm = async () => {
    if (!selectedPlan?.priceNumber) return;
    setIsProcessing(true);
    try {
      await onBankTransferPayment({ planKey: selectedPlanId, amount: selectedPlan.priceNumber });
      setBankTransferStep('upload');
    } catch {
      // Error already toasted by hook
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setIsProcessing(true);
    try {
      const payment = await api.getLatestManualPayment(companyId);
      if (!payment) {
        toast.error('No se encontró un pago pendiente.');
        return;
      }
      await api.uploadReceipt({ companyId, paymentId: payment.id, file: uploadFile });
      toast.success('Comprobante enviado correctamente');
      setBankPaymentStatus('pending');
      setBankTransferStep('status');
    } catch {
      toast.error('Error al enviar el comprobante.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Realtime subscription + fallback poll for payment status
  useEffect(() => {
    if (bankTransferStep !== 'status' || !companyId) return;

    const poll = async () => {
      try {
        const payment = await api.getLatestManualPayment(companyId);
        if (!payment) return;
        setBankPaymentStatus(payment.status as BankPaymentStatus);
        setBankRejectionReason(payment.rejectionReason ?? null);
      } catch {
        // Silently ignore poll errors
      }
    };

    poll(); // Initial fetch

    // Realtime subscription
    channelRef.current = supabase
      .channel(`billing-bank-transfer:${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'manual_payments',
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          poll();
        }
      )
      .subscribe();

    // Fallback poll every 60s
    pollIntervalRef.current = setInterval(poll, 60_000);

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [bankTransferStep, companyId]);

  // Stop polling on terminal status; auto-close on approval
  useEffect(() => {
    if (bankPaymentStatus === 'approved' || bankPaymentStatus === 'rejected') {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
    if (bankPaymentStatus === 'approved') {
      autoCloseRef.current = setTimeout(async () => {
        setShowPaymentDialog(false);
        setBankTransferStep('details');
        await onSubscriptionChange();
      }, 3000);
      return () => {
        if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
      };
    }
  }, [bankPaymentStatus, onSubscriptionChange]);

  // Plan selector (for new subscriptions only)
  const renderPlanSelector = () => (
    <>
      {/* Plan cards */}
      <div className="space-y-2 mb-4">
        {plansData.map((plan) => (
          <div
            key={plan.id}
            onClick={() => {
              setSelectedPlanId(plan.id);
              setPlanError('');
            }}
            className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
              selectedPlanId === plan.id
                ? 'border-primary ring-1 ring-primary bg-background'
                : 'border-border hover:border-border bg-background'
            }`}
          >
            {/* Radio */}
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedPlanId === plan.id ? 'border-primary bg-primary' : 'border-border'
              }`}
            >
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

      {/* Payment method picker */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Método de pago</p>
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setPaymentMethod('card')}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              paymentMethod === 'card'
                ? 'border-primary ring-1 ring-primary bg-background'
                : 'border-border hover:border-border bg-background'
            }`}
          >
            <CreditCardIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Tarjeta</p>
              <p className="text-xs text-muted-foreground">Crédito o débito</p>
            </div>
          </div>
          <div
            onClick={() => setPaymentMethod('bank_transfer')}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              paymentMethod === 'bank_transfer'
                ? 'border-primary ring-1 ring-primary bg-background'
                : 'border-border hover:border-border bg-background'
            }`}
          >
            <Building2 className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-foreground">Transferencia</p>
              <p className="text-xs text-muted-foreground">Bancaria</p>
            </div>
          </div>
        </div>

        <Button onClick={handleOpenPaymentDialog} className="w-full">
          Continuar
        </Button>
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
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
            . Suscribite a un plan antes de esa fecha para mantener el acceso.
          </p>
        </div>
      )}

      {/* SECTION 1: Plan */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium text-foreground">Plan</h3>
            {statusConfig && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${statusConfig.className}`}
              >
                {statusConfig.label}
              </span>
            )}
          </div>
          {canChangePlan && (
            <Button type="button" variant="outline" onClick={() => setShowChangePlanModal(true)}>
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
                {isBankTransfer ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-1">Método de pago</p>
                    <p className="text-sm font-medium text-foreground">Transferencia bancaria</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-1">Proximo cobro</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(subscription.nextBillingTime)}
                    </p>
                  </>
                )}
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
            <p className="text-xs text-muted-foreground mb-3">
              Selecciona un plan para suscribirte
            </p>
            {renderPlanSelector()}
          </div>
        )}

        {/* No subscription message */}
        {!subscription && !showPlanSelection && (
          <p className="text-sm text-muted-foreground">No tienes un plan activo.</p>
        )}
      </div>

      {/* SECTION 2: Payment method (MercadoPago only) */}
      {subscription && !needsSubscription && !isBankTransfer && (
        <div className="border-t border-border pt-5 mt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-foreground">Método de pago</h3>
            {canChangePlan && subscription.mpPreapprovalId && (
              <Button type="button" variant="outline" onClick={() => setShowChangeCardForm(true)}>
                Cambiar tarjeta
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
                {cardBrand ? CARD_BRANDS[cardBrand] || cardBrand : 'Tarjeta de crédito/débito'}
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
        </div>
      )}

      {/* Change card dialog */}
      <Dialog
        open={showChangeCardForm}
        onOpenChange={(open) => {
          if (!open) setShowChangeCardForm(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar tarjeta</DialogTitle>
            <DialogDescription>
              Ingresá los datos de tu nueva tarjeta de crédito o débito.
            </DialogDescription>
          </DialogHeader>
          <ChangeCardForm
            onTokenReady={async (cardTokenId) => {
              await onChangeCard(cardTokenId);
              setShowChangeCardForm(false);
            }}
            onCancel={() => setShowChangeCardForm(false)}
          />
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
              const paymentStatus =
                PAYMENT_STATUS_CONFIG[payment.status] || PAYMENT_STATUS_CONFIG.pending;
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm text-foreground">
                      {formatCurrency(payment.grossAmount, payment.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(payment.paidAt)}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${paymentStatus.className}`}
                  >
                    {paymentStatus.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: Cancel plan (MercadoPago only) */}
      {subscription && !needsSubscription && !isBankTransfer && (
        <div className="border-t border-border pt-5 mt-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircleIcon className="w-4 h-4 text-destructive" />
            <h3 className="text-base font-medium text-destructive">Cancelar plan</h3>
          </div>

          {subscription.status === 'active' && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Al cancelar, mantendras acceso hasta el final del periodo de facturacion actual
                {subscription.nextBillingTime && <> ({formatDate(subscription.nextBillingTime)})</>}
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
                <> Acceso disponible hasta {formatDate(subscription.nextBillingTime)}.</>
              )}
            </p>
          )}
        </div>
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
              {subscription?.nextBillingTime && <> ({formatDate(subscription.nextBillingTime)})</>}.
              Después de eso, perderás acceso a las funcionalidades del plan.
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

      {/* Card Payment Dialog */}
      <Dialog
        open={showPaymentDialog && paymentMethod === 'card'}
        onOpenChange={handleClosePaymentDialog}
      >
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
                  <div className="w-6 h-6 border-2 border-border border-t-neutral-900 rounded-full animate-spin mx-auto mb-2" />
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
                  });
                  setShowPaymentDialog(false);
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
          </div>
          {planError && <p className="text-sm text-destructive text-center">{planError}</p>}
        </DialogContent>
      </Dialog>

      {/* Bank Transfer Dialog (multi-step: details → upload → status) */}
      <Dialog
        open={showPaymentDialog && paymentMethod === 'bank_transfer'}
        onOpenChange={handleClosePaymentDialog}
      >
        <DialogContent className="sm:max-w-md">
          {/* Step 1: Bank details */}
          {bankTransferStep === 'details' && (
            <>
              <DialogHeader>
                <DialogTitle>Transferencia bancaria</DialogTitle>
                <DialogDescription>
                  {selectedPlan
                    ? `${selectedPlan.name} — ${selectedPlan.price}${selectedPlan.priceSuffix}`
                    : 'Seleccioná un plan'}
                </DialogDescription>
              </DialogHeader>
              <BankDetailsCard />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost" disabled={isProcessing}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button onClick={handleBankTransferConfirm} loading={isProcessing}>
                  Confirmar
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 2: Upload receipt */}
          {bankTransferStep === 'upload' && (
            <>
              <DialogHeader>
                <DialogTitle>Subí tu comprobante</DialogTitle>
                <DialogDescription>
                  Adjuntá el comprobante de la transferencia para que podamos verificar tu pago.
                </DialogDescription>
              </DialogHeader>
              <FileUpload
                onFileSelect={setUploadFile}
                accept=".pdf,.png,.jpg,.jpeg"
                label="Comprobante de transferencia"
              />
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => handleClosePaymentDialog(false)}
                  disabled={isProcessing}
                >
                  Lo subiré más tarde
                </Button>
                <Button onClick={handleUploadSubmit} disabled={!uploadFile} loading={isProcessing}>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 3: Payment status */}
          {bankTransferStep === 'status' && (
            <>
              <DialogHeader>
                <DialogTitle>Estado del pago</DialogTitle>
              </DialogHeader>
              <div className="py-4 text-center space-y-4">
                {bankPaymentStatus === 'pending' && (
                  <>
                    <div className="mx-auto h-14 w-14 rounded-lg bg-amber-50 border border-amber-200/50 flex items-center justify-center">
                      <Clock className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Pago pendiente de verificación
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Recibimos tu comprobante. Te notificaremos cuando sea aprobado.
                      </p>
                    </div>
                  </>
                )}
                {bankPaymentStatus === 'approved' && (
                  <>
                    <div className="mx-auto h-14 w-14 rounded-lg bg-emerald-50 border border-emerald-200/50 flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">¡Pago aprobado!</p>
                      <p className="text-sm text-muted-foreground">Tu suscripción está activa.</p>
                    </div>
                  </>
                )}
                {bankPaymentStatus === 'rejected' && (
                  <>
                    <div className="mx-auto h-14 w-14 rounded-lg bg-red-50 border border-red-200/50 flex items-center justify-center">
                      <XCircle className="w-7 h-7 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Pago rechazado</p>
                      {bankRejectionReason && (
                        <div className="rounded-lg bg-muted border border-border p-3 mt-2 text-left">
                          <p className="text-sm text-muted-foreground">{bankRejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                {bankPaymentStatus === 'rejected' && (
                  <Button variant="ghost" onClick={() => setBankTransferStep('upload')}>
                    Subir nuevo comprobante
                  </Button>
                )}
                <Button
                  variant={bankPaymentStatus === 'approved' ? 'default' : 'ghost'}
                  onClick={() => handleClosePaymentDialog(false)}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
