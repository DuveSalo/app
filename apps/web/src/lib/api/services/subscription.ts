import { supabase } from '../../supabase/client';
import { AuthError, DatabaseError } from '../../utils/errors';
import type { Tables } from '../../../types/database.types';
import type {
  Subscription,
  PaymentTransaction,
  SubscriptionStatus,
  MpCreateSubscriptionRequest,
  MpCreateSubscriptionResponse,
  MpManageSubscriptionRequest,
  MpManageSubscriptionResponse,
  MpSubscriptionStatusResponse,
} from '../../../types/subscription';

type MpManageSubscriptionInvokeParams = MpManageSubscriptionRequest & {
  idempotencyKey?: string;
};

// DB row to domain mapper
function mapSubscriptionFromDb(data: Tables<'subscriptions'>): Subscription {
  return {
    id: data.id,
    companyId: data.company_id,
    mpPreapprovalId: data.mp_preapproval_id || null,
    mpPlanId: data.mp_plan_id || null,
    planKey: data.plan_key,
    planName: data.plan_name,
    amount: data.amount,
    currency: data.currency || 'ARS',
    status: data.status as SubscriptionStatus,
    paymentProvider: data.payment_provider || 'mercadopago',
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

function mapTransactionFromDb(data: Tables<'payment_transactions'>): PaymentTransaction {
  return {
    id: data.id,
    subscriptionId: data.subscription_id || null,
    companyId: data.company_id,
    transactionId: data.paypal_transaction_id || '', // DB column name kept for compatibility
    grossAmount: data.gross_amount,
    feeAmount: data.fee_amount ?? null,
    netAmount: data.net_amount ?? null,
    currency: data.currency || 'ARS',
    status: data.status as PaymentTransaction['status'],
    paidAt: data.paid_at || null,
    createdAt: data.created_at,
  };
}

/**
 * Ensure the current session is alive by calling getUser() which validates
 * the token server-side and triggers a refresh if the access token expired.
 * This prevents "Invalid JWT" errors when calling Edge Functions with stale tokens.
 */
async function ensureValidSession(): Promise<void> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new AuthError('Sesión expirada. Iniciá sesión nuevamente.');
  if (!data.user) throw new AuthError('No hay sesión activa. Iniciá sesión nuevamente.');
}

/**
 * Create a MercadoPago subscription with card_token_id via Edge Function.
 */
export async function mpCreateSubscription(
  params: MpCreateSubscriptionRequest
): Promise<MpCreateSubscriptionResponse> {
  await ensureValidSession();

  const { data, error } = await supabase.functions.invoke('mp-create-subscription', {
    body: params,
  });
  if (error) throw new DatabaseError(error.message);
  return data as MpCreateSubscriptionResponse;
}

/**
 * Manage MercadoPago subscription (upgrade, downgrade, cancel, pause, reactivate, change card).
 */
export async function mpManageSubscription(
  params: MpManageSubscriptionInvokeParams
): Promise<MpManageSubscriptionResponse> {
  await ensureValidSession();

  const { idempotencyKey, ...body } = params;
  const requestId = idempotencyKey?.trim() || globalThis.crypto.randomUUID();

  const { data, error } = await supabase.functions.invoke('mp-manage-subscription', {
    body,
    headers: {
      'X-Idempotency-Key': requestId,
    },
  });
  if (error) throw new DatabaseError(error.message);
  return data as MpManageSubscriptionResponse;
}

/**
 * Fetch fresh subscription status from MercadoPago API.
 * Syncs next_billing_time in DB and returns card info.
 */
export async function mpGetSubscriptionStatus(
  mpPreapprovalId: string
): Promise<MpSubscriptionStatusResponse> {
  await ensureValidSession();

  const { data, error } = await supabase.functions.invoke('mp-get-subscription-status', {
    body: { mpPreapprovalId },
  });
  if (error) throw new DatabaseError(error.message);
  return data as MpSubscriptionStatusResponse;
}

/**
 * Get the active (or most recent) subscription for a company.
 */
export async function getActiveSubscription(companyId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      'id, company_id, mp_preapproval_id, mp_plan_id, plan_key, plan_name, amount, currency, status, payment_provider, subscriber_email, current_period_start, current_period_end, next_billing_time, activated_at, cancelled_at, suspended_at, failed_payments_count, created_at, updated_at, paypal_plan_id, paypal_subscription_id'
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
    .from('payment_transactions')
    .select(
      'id, subscription_id, company_id, paypal_transaction_id, gross_amount, fee_amount, net_amount, currency, status, paid_at, created_at, card_brand, card_last_four, payment_type_id'
    )
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new DatabaseError(error.message);
  if (!data) return [];

  return data.map((row) => mapTransactionFromDb(row));
}

/**
 * Get card brand and last four digits from the latest completed payment.
 * Used as fallback when MercadoPago API doesn't return card details.
 */
export async function getCardInfoFromPayments(
  companyId: string
): Promise<{ cardBrand: string | null; cardLastFour: string | null }> {
  const { data } = await supabase
    .from('payment_transactions')
    .select('card_brand, card_last_four')
    .eq('company_id', companyId)
    .eq('status', 'completed')
    .not('card_last_four', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    cardBrand: data?.card_brand ?? null,
    cardLastFour: data?.card_last_four ?? null,
  };
}
