import { useState, useEffect } from 'react';
import { usePlans } from '../../../lib/hooks/usePlans';
import { ChangePlanModal } from './ChangePlanModal';
import { TrialInfoCard } from './billing/TrialInfoCard';
import { ActivePlanCard } from './billing/ActivePlanCard';
import { BankTransferPlanCard } from './billing/BankTransferPlanCard';
import { BankTransferPendingCard } from './billing/BankTransferPendingCard';
import { NewSubscriptionSection } from './billing/NewSubscriptionSection';
import { PaymentHistorySection } from './billing/PaymentHistorySection';
import { CancelPlanSection } from './billing/CancelPlanSection';
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
  onBankTransferPayment: (data: { planKey: string; amount: number }) => Promise<void>;
  userEmail?: string;
  trialEndsAt?: string;
}

export const BillingSection = ({
  companyId,
  subscription,
  payments,
  isLoading,
  onCancel,
  onReactivate,
  onChangePlan,
  onBankTransferPayment,
  onSubscriptionChange,
  trialEndsAt,
}: BillingSectionProps) => {
  const { plans: plansData } = usePlans();
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('basic');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const bankTransfer = useBankTransferFlow({
    companyId,
    onSubscriptionChange,
    onConfirmPayment: (planKey, amount) => onBankTransferPayment({ planKey, amount }),
  });

  const isBankTransfer = subscription?.paymentProvider === 'bank_transfer';
  const isPendingApproval = subscription?.status === 'approval_pending';
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

  // When a bank transfer payment is pending admin approval, the user should see
  // only the pending-approval notice — not the plan card, payment history, or cancel flow.
  // Prevents showing misleading "Activa" status before the payment is verified.
  if (isPendingApproval && isBankTransfer && subscription) {
    return (
      <div className="space-y-5">
        <BankTransferPendingCard planName={subscription.planName} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!subscription && trialEndsAt && <TrialInfoCard trialEndsAt={trialEndsAt} />}

      {/* SECTION 1: Plan */}
      <div>
        {subscription &&
          !needsSubscription &&
          (isBankTransfer ? (
            <BankTransferPlanCard subscription={subscription} />
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
              planError=""
              onSelectPlan={setSelectedPlanId}
              onContinue={() => setShowPaymentDialog(true)}
            />
          </div>
        )}
      </div>

      {/* SECTION 2: Payment history */}
      <PaymentHistorySection payments={payments} />

      {/* SECTION 3: Cancel plan (bank transfer only) */}
      {subscription && !needsSubscription && isBankTransfer && (
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

      {/* Bank Transfer Dialog */}
      <BankTransferDialog
        open={showPaymentDialog}
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
