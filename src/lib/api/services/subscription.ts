
import { supabase } from '../../supabase/client';
import { AuthError } from '../../utils/errors';

/** Get company ID from the current session in a single query (avoids N+1) */
async function getSessionCompanyId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new AuthError("Usuario no autenticado");

  const { data, error } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data) throw new AuthError("Empresa no encontrada");
  return data.id;
}

export interface SubscriptionRecord {
  id: string;
  companyId: string;
  mpPreapprovalId: string | null;
  planId: string;
  planName: string;
  amount: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  nextPaymentDate: string | null;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  subscriptionId: string | null;
  companyId: string;
  mpPaymentId: string | null;
  amount: number;
  currency: string;
  status: string;
  statusDetail: string | null;
  paymentMethod: string | null;
  paymentType: string | null;
  dateCreated: string;
  dateApproved: string | null;
}

export const getActiveSubscription = async (): Promise<SubscriptionRecord | null> => {
  const companyId = await getSessionCompanyId();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, company_id, mp_preapproval_id, plan_id, plan_name, amount, status, start_date, end_date, next_payment_date, created_at')
    .eq('company_id', companyId)
    .in('status', ['pending', 'authorized', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching active subscription:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    companyId: data.company_id,
    mpPreapprovalId: data.mp_preapproval_id,
    planId: data.plan_id,
    planName: data.plan_name,
    amount: data.amount,
    status: data.status,
    startDate: data.start_date,
    endDate: data.end_date,
    nextPaymentDate: data.next_payment_date,
    createdAt: data.created_at,
  };
};

export const getPaymentHistory = async (): Promise<PaymentTransaction[]> => {
  const companyId = await getSessionCompanyId();

  const { data, error } = await supabase
    .from('payment_transactions')
    .select('id, subscription_id, company_id, mp_payment_id, amount, currency, status, status_detail, payment_method, payment_type, date_created, date_approved')
    .eq('company_id', companyId)
    .order('date_created', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }

  return (data || []).map(t => ({
    id: t.id,
    subscriptionId: t.subscription_id,
    companyId: t.company_id,
    mpPaymentId: t.mp_payment_id,
    amount: t.amount,
    currency: t.currency || 'ARS',
    status: t.status,
    statusDetail: t.status_detail,
    paymentMethod: t.payment_method,
    paymentType: t.payment_type,
    dateCreated: t.date_created,
    dateApproved: t.date_approved,
  }));
};
