export type SubscriptionStatus =
  | 'pending'
  | 'approval_pending'
  | 'active'
  | 'suspended'
  | 'cancelled'
  | 'expired';

export type PaymentProvider = 'paypal' | 'mercadopago';

export interface Subscription {
  readonly id: string;
  companyId: string;
  paymentProvider: PaymentProvider;
  // PayPal IDs
  paypalSubscriptionId: string | null;
  paypalPlanId: string | null;
  // MercadoPago IDs
  mpPreapprovalId: string | null;
  mpPlanId: string | null;
  // Plan info
  planKey: string;
  planName: string;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
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
  paypalTransactionId: string;
  grossAmount: number;
  feeAmount: number | null;
  netAmount: number | null;
  currency: string;
  status: 'completed' | 'pending' | 'refunded' | 'failed';
  paidAt: string | null;
  createdAt: string;
}

// --- PayPal types (existing) ---

export interface CreateSubscriptionRequest {
  planKey: string;
  companyId: string;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
}

export interface ActivateSubscriptionRequest {
  subscriptionId: string;
  companyId: string;
  /** When present, indicates a plan change and triggers planChangedEmail instead of subscriptionActivatedEmail. */
  oldPlanName?: string;
}

export interface ActivateSubscriptionResponse {
  success: boolean;
  status: 'active' | 'pending' | string;
  message?: string;
}

export interface ManageSubscriptionRequest {
  action: 'cancel' | 'suspend' | 'reactivate';
  subscriptionId: string;
  reason?: string;
}

export interface ManageSubscriptionResponse {
  success: boolean;
  action: string;
  status: string;
}

// --- MercadoPago types ---

export interface MpCreateSubscriptionRequest {
  planKey: string;
  companyId: string;
  cardTokenId: string;
  payerEmail: string;
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
