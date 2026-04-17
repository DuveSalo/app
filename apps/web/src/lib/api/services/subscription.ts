import { supabase } from '../../supabase/client';
import { DatabaseError } from '../../utils/errors';
import type { Tables } from '../../../types/database.types';
import type {
  Subscription,
  PaymentTransaction,
  SubscriptionStatus,
} from '../../../types/subscription';

const MANUAL_PAYMENT_HISTORY_COLUMNS = 'id, company_id, amount, status, reviewed_at, created_at';

type SubscriptionRow = Pick<
  Tables<'subscriptions'>,
  | 'id'
  | 'company_id'
  | 'plan_key'
  | 'plan_name'
  | 'amount'
  | 'currency'
  | 'status'
  | 'payment_provider'
  | 'subscriber_email'
  | 'current_period_start'
  | 'current_period_end'
  | 'next_billing_time'
  | 'activated_at'
  | 'cancelled_at'
  | 'suspended_at'
  | 'failed_payments_count'
  | 'created_at'
  | 'updated_at'
>;

// DB row to domain mapper
function mapSubscriptionFromDb(data: SubscriptionRow): Subscription {
  return {
    id: data.id,
    companyId: data.company_id,
    planKey: data.plan_key,
    planName: data.plan_name,
    amount: data.amount,
    currency: data.currency || 'ARS',
    status: data.status as SubscriptionStatus,
    paymentProvider: data.payment_provider || 'bank_transfer',
    subscriberEmail: data.subscriber_email || null,
    currentPeriodStart: data.current_period_start || null,
    currentPeriodEnd: data.current_period_end || null,
    nextBillingTime: data.next_billing_time || null,
    activatedAt: data.activated_at || null,
    cancelledAt: data.cancelled_at || null,
    suspendedAt: data.suspended_at || null,
    failedPaymentsCount: data.failed_payments_count || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapManualPaymentFromDb(
  data: Pick<
    Tables<'manual_payments'>,
    'id' | 'company_id' | 'amount' | 'status' | 'reviewed_at' | 'created_at'
  >
): PaymentTransaction {
  return {
    id: data.id,
    subscriptionId: null,
    companyId: data.company_id,
    transactionId: data.id,
    grossAmount: data.amount,
    feeAmount: null,
    netAmount: data.amount,
    currency: 'ARS',
    status: data.status as PaymentTransaction['status'],
    paidAt: data.reviewed_at || data.created_at,
    createdAt: data.created_at,
  };
}

/**
 * Get the active (or most recent) subscription for a company.
 */
export async function getActiveSubscription(companyId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      'id, company_id, plan_key, plan_name, amount, currency, status, payment_provider, subscriber_email, current_period_start, current_period_end, next_billing_time, activated_at, cancelled_at, suspended_at, failed_payments_count, created_at, updated_at'
    )
    .eq('company_id', companyId)
    .in('status', ['active', 'suspended', 'cancelled', 'approval_pending'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new DatabaseError(error.message);
  if (!data) return null;

  return mapSubscriptionFromDb(data);
}

/**
 * Get payment history for a company.
 */
export async function getPaymentHistory(
  companyId: string,
  limit = 5
): Promise<PaymentTransaction[]> {
  const { data, error } = await supabase
    .from('manual_payments')
    .select(MANUAL_PAYMENT_HISTORY_COLUMNS)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new DatabaseError(error.message);
  if (!data) return [];

  return data.map((row) => mapManualPaymentFromDb(row));
}
