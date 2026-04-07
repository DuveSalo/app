import { useState, useEffect } from 'react';
import { usePlans } from '../../../lib/hooks/usePlans';
import { ChangePlanModal } from './ChangePlanModal';
import { TrialInfoCard } from './billing/TrialInfoCard';
import { ActivePlanCard } from './billing/ActivePlanCard';
import { BankTransferPlanCard } from './billing/BankTransferPlanCard';
import { NewSubscriptionSection } from './billing/NewSubscriptionSection';
import { PaymentMethodSection } from './billing/PaymentMethodSection';
import { PaymentHistorySection } from './billing/PaymentHistorySection';
import { CancelPlanSection } from './billing/CancelPlanSection';
import { CardPaymentDialog } from './billing/CardPaymentDialog';
import { BankTransferDialog } from './billing/BankTransferDialog';
import { useBankTransferFlow } from './billing/useBankTransferFlow';
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
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('basic');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const bankTransfer = useBankTransferFlow({
    companyId,
    onSubscriptionChange,
    onConfirmPayment: (planKey, amount) => onBankTransferPayment({ planKey, amount }),
  });

  const isBankTransfer = subscription?.paymentProvider === 'bank_transfer';
  const needsSubscription = !subscription || subscription.status === 'cancelled';
  const canChangePlan = subscription?.status === 'active' && !isBankTransfer;

  useEffect(() => {
    if (plansData.length === 0) return;
    setSelectedPlanId((current) =>
      plansData.some((p) => p.id === current) ? current : plansData[0].id
    );
  }, [plansData]);

  const selectedPlan = plansData.find((p) => p.id === selectedPlanId);

  const handleCloseBankTransferDialog = (open: boolean) => {
    if (!open && bankTransfer.isProcessing) return;
    setShowPaymentDialog(open);
    if (!open) bankTransfer.reset();
  };

  return (
    <div className="space-y-5">
      {!subscription && trialEndsAt && <TrialInfoCard trialEndsAt={trialEndsAt} />}

      {/* SECTION 1: Plan */}
      <div>
        {subscription &&
          !needsSubscription &&
          (isBankTransfer ? (
            <BankTransferPlanCard planName={subscription.planName} />
          ) : (
            <ActivePlanCard
              subscription={subscription}
              canChangePlan={canChangePlan}
              onChangePlan={() => setShowChangePlanModal(true)}
            />
          ))}

        {needsSubscription && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-foreground">Plan</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Selecciona un plan para suscribirte
            </p>
            <NewSubscriptionSection
              plans={plansData}
              selectedPlanId={selectedPlanId}
              paymentMethod={paymentMethod}
              planError=""
              onSelectPlan={setSelectedPlanId}
              onSelectPaymentMethod={setPaymentMethod}
              onContinue={() => setShowPaymentDialog(true)}
            />
          </div>
        )}
      </div>

      {/* SECTION 2: Payment method (MercadoPago only) */}
      {subscription && !needsSubscription && !isBankTransfer && (
        <PaymentMethodSection
          canChangePlan={canChangePlan}
          cardBrand={cardBrand}
          cardLastFour={cardLastFour}
          mpPreapprovalId={subscription.mpPreapprovalId}
          onChangeCard={onChangeCard}
        />
      )}

      {/* SECTION 3: Payment history */}
      <PaymentHistorySection payments={payments} />

      {/* SECTION 4: Cancel plan (MercadoPago only) */}
      {subscription && !needsSubscription && !isBankTransfer && (
        <CancelPlanSection
          subscription={subscription}
          isLoading={isLoading}
          onCancel={onCancel}
          onReactivate={onReactivate}
        />
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

      {/* Card Payment Dialog */}
      <CardPaymentDialog
        open={showPaymentDialog && paymentMethod === 'card'}
        onOpenChange={(open) => {
          if (!open) setShowPaymentDialog(false);
          else setShowPaymentDialog(true);
        }}
        selectedPlan={selectedPlan}
        selectedPlanId={selectedPlanId}
        userEmail={userEmail}
        onCreateSubscription={onCreateSubscription}
      />

      {/* Bank Transfer Dialog */}
      <BankTransferDialog
        open={showPaymentDialog && paymentMethod === 'bank_transfer'}
        onOpenChange={handleCloseBankTransferDialog}
        step={bankTransfer.step}
        selectedPlan={selectedPlan}
        isProcessing={bankTransfer.isProcessing}
        uploadFile={bankTransfer.uploadFile}
        onFileSelect={bankTransfer.setUploadFile}
        paymentStatus={bankTransfer.paymentStatus}
        rejectionReason={bankTransfer.rejectionReason}
        onConfirmDetails={() =>
          bankTransfer.handleConfirmDetails(selectedPlanId, selectedPlan?.priceNumber ?? 0)
        }
        onUploadSubmit={bankTransfer.handleUploadSubmit}
        onRetryUpload={bankTransfer.retryUpload}
      />
    </div>
  );
};
