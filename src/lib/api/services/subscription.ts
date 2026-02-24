import { supabase } from '../../supabase/client';
import type {
  Subscription,
  PaymentTransaction,
  SubscriptionStatus,
  PaymentProvider,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  ActivateSubscriptionRequest,
  ActivateSubscriptionResponse,
  ManageSubscriptionRequest,
  ManageSubscriptionResponse,
  MpCreateSubscriptionRequest,
  MpCreateSubscriptionResponse,
  MpManageSubscriptionRequest,
  MpManageSubscriptionResponse,
} from '../../../types/subscription';

// DB row to domain mapper
function mapSubscriptionFromDb(data: Record<string, unknown>): Subscription {
  return {
    id: data.id as string,
    companyId: data.company_id as string,
    paymentProvider: (data.payment_provider as PaymentProvider) || 'paypal',
    paypalSubscriptionId: (data.paypal_subscription_id as string) || null,
    paypalPlanId: (data.paypal_plan_id as string) || null,
    mpPreapprovalId: (data.mp_preapproval_id as string) || null,
    mpPlanId: (data.mp_plan_id as string) || null,
    planKey: data.plan_key as string,
    planName: data.plan_name as string,
    amount: Number(data.amount),
    currency: (data.currency as string) || 'USD',
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
    paypalTransactionId: data.paypal_transaction_id as string,
    grossAmount: Number(data.gross_amount),
    feeAmount: data.fee_amount ? Number(data.fee_amount) : null,
    netAmount: data.net_amount ? Number(data.net_amount) : null,
    currency: (data.currency as string) || 'USD',
    status: data.status as PaymentTransaction['status'],
    paidAt: (data.paid_at as string) || null,
    createdAt: data.created_at as string,
  };
}

/**
 * Create a PayPal subscription via Edge Function.
 */
export async function createSubscription(
  params: CreateSubscriptionRequest,
): Promise<CreateSubscriptionResponse> {
  const { data, error } = await supabase.functions.invoke('create-subscription', {
    body: params,
  });
  if (error) throw new Error(error.message);
  return data as CreateSubscriptionResponse;
}

/**
 * Activate a subscription after PayPal approval.
 */
export async function activateSubscription(
  params: ActivateSubscriptionRequest,
): Promise<ActivateSubscriptionResponse> {
  const { data, error } = await supabase.functions.invoke('activate-subscription', {
    body: params,
  });
  if (error) throw new Error(error.message);
  return data as ActivateSubscriptionResponse;
}

/**
 * Manage subscription lifecycle (cancel, suspend, reactivate).
 */
export async function manageSubscription(
  params: ManageSubscriptionRequest,
): Promise<ManageSubscriptionResponse> {
  const { data, error } = await supabase.functions.invoke('manage-subscription', {
    body: params,
  });
  if (error) throw new Error(error.message);
  return data as ManageSubscriptionResponse;
}

// --- MercadoPago functions ---

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

// --- Shared functions ---

/**
 * Get the active (or most recent) subscription for a company.
 */
export async function getActiveSubscription(
  companyId: string,
): Promise<Subscription | null> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!data) return [];

  return data.map((row) => mapTransactionFromDb(row as Record<string, unknown>));
}
