export type SubscriptionStatus =
  | 'active'
  | 'pending'
  | 'approval_pending'
  | 'cancelled'
  | 'suspended'
  | 'expired';

export type CompanySubscriptionStatus = 'active' | 'pending' | 'cancelled' | 'paused';

// Helper for exhaustive switch statements
export function assertNever(x: never): never {
  throw new Error('Unhandled case: ' + String(x));
}

export interface Subscription {
  readonly id: string;
  companyId: string;
  mpPreapprovalId: string | null;
  mpPlanId: string | null;
  planKey: string;
  planName: string;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  paymentProvider: string;
  subscriberEmail: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  nextBillingTime: string | null;
  activatedAt: string | null;
  cancelledAt: string | null;
  suspendedAt: string | null;
  failedPaymentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  readonly id: string;
  subscriptionId: string | null;
  companyId: string;
  transactionId: string;
  grossAmount: number;
  feeAmount: number | null;
  netAmount: number | null;
  currency: string;
  status: 'completed' | 'pending' | 'refunded' | 'failed';
  paidAt: string | null;
  createdAt: string;
}

// --- MercadoPago types ---

export interface MpCreateSubscriptionRequest {
  planKey: string;
  companyId: string;
  cardTokenId: string;
  payerEmail: string;
  cardBrand?: string | null;
  cardLastFour?: string | null;
  paymentTypeId?: string | null;
}

export interface MpCreateSubscriptionResponse {
  success: boolean;
  subscriptionId: string;
  status: string;
}

export type MpManageAction = 'change_plan' | 'change_card' | 'cancel' | 'pause' | 'reactivate';

export interface MpManageSubscriptionRequest {
  action: MpManageAction;
  mpPreapprovalId: string;
  newPlanKey?: string;
  cardTokenId?: string;
  reason?: string;
}

export interface MpManageSubscriptionResponse {
  success: boolean;
  action: string;
  status: string;
}

export interface MpSubscriptionStatusResponse {
  nextPaymentDate: string | null;
  paymentMethodId: string | null;
  cardLastFour: string | null;
}
