import { supabase } from '../../supabase/client';
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

// DB row to domain mapper
function mapSubscriptionFromDb(data: Record<string, unknown>): Subscription {
  return {
    id: data.id as string,
    companyId: data.company_id as string,
    mpPreapprovalId: (data.mp_preapproval_id as string) || null,
    mpPlanId: (data.mp_plan_id as string) || null,
    planKey: data.plan_key as string,
    planName: data.plan_name as string,
    amount: Number(data.amount),
    currency: (data.currency as string) || 'ARS',
    status: data.status as SubscriptionStatus,
    subscriberEmail: (data.subscriber_email as string) || null,
    currentPeriodStart: (data.current_period_start as string) || null,
    currentPeriodEnd: (data.current_period_end as string) || null,
    nextBillingTime: (data.next_billing_time as string) || null,
    activatedAt: (data.activated_at as string) || null,
    cancelledAt: (data.cancelled_at as string) || null,
    suspendedAt: (data.suspended_at as string) || null,
    failedPaymentsCount: (data.failed_payments_count as number) || 0,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

function mapTransactionFromDb(data: Record<string, unknown>): PaymentTransaction {
  return {
    id: data.id as string,
    subscriptionId: (data.subscription_id as string) || null,
    companyId: data.company_id as string,
    transactionId: (data.paypal_transaction_id as string) || '', // DB column name kept for compatibility
    grossAmount: Number(data.gross_amount),
    feeAmount: data.fee_amount ? Number(data.fee_amount) : null,
    netAmount: data.net_amount ? Number(data.net_amount) : null,
    currency: (data.currency as string) || 'ARS',
    status: data.status as PaymentTransaction['status'],
    paidAt: (data.paid_at as string) || null,
    createdAt: data.created_at as string,
  };
}

/**
 * Create a MercadoPago subscription with card_token_id via Edge Function.
 */
export async function mpCreateSubscription(
  params: MpCreateSubscriptionRequest,
): Promise<MpCreateSubscriptionResponse> {
  const { data, error } = await supabase.functions.invoke('mp-create-subscription', {
    body: params,
  });
  if (error) throw new Error(error.message);
  return data as MpCreateSubscriptionResponse;
}

/**
 * Manage MercadoPago subscription (upgrade, downgrade, cancel, pause, reactivate, change card).
 */
export async function mpManageSubscription(
  params: MpManageSubscriptionRequest,
): Promise<MpManageSubscriptionResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase.functions.invoke('mp-manage-subscription', {
    body: params,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error) throw new Error(error.message);
  return data as MpManageSubscriptionResponse;
}

/**
 * Fetch fresh subscription status from MercadoPago API.
 * Syncs next_billing_time in DB and returns card info.
 */
export async function mpGetSubscriptionStatus(
  mpPreapprovalId: string,
): Promise<MpSubscriptionStatusResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase.functions.invoke('mp-get-subscription-status', {
    body: { mpPreapprovalId },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error) throw new Error(error.message);
  return data as MpSubscriptionStatusResponse;
}

/**
 * Get the active (or most recent) subscription for a company.
 */
export async function getActiveSubscription(
  companyId: string,
): Promise<Subscription | null> {
  // Tables 'subscriptions' and 'payment_transactions' exist in DB but not in generated types yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('subscriptions')
    .select('*')
    .eq('company_id', companyId)
    .in('status', ['active', 'suspended', 'cancelled', 'approval_pending'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapSubscriptionFromDb(data as Record<string, unknown>);
}

/**
 * Get payment history for a company.
 */
export async function getPaymentHistory(
  companyId: string,
  limit = 5,
): Promise<PaymentTransaction[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('payment_transactions')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!data) return [];

  return (data as Record<string, unknown>[]).map((row) => mapTransactionFromDb(row));
}
