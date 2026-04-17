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
  status: 'approved' | 'pending' | 'rejected';
  paidAt: string | null;
  createdAt: string;
}
