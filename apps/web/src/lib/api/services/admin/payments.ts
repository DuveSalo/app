import { supabase } from '../../../supabase/client';
import { handleSupabaseError } from '../../../utils/errors';
import type { Tables } from '../../../../types/database.types';
import type { AdminPaymentRow } from '../../../../features/admin/types';

/** Subset of payment_transactions columns used by mapTxRow + queryTransactions */
type PaymentTxRow = Pick<
  Tables<'payment_transactions'>,
  | 'id'
  | 'company_id'
  | 'gross_amount'
  | 'currency'
  | 'status'
  | 'created_at'
  | 'paid_at'
  | 'payment_type_id'
  | 'card_brand'
  | 'card_last_four'
> & {
  subscriptions: { current_period_end: string | null } | null;
};

/**
 * Card detail columns (payment_type_id, card_brand, card_last_four) are available
 * after migration 20260325130000. Until then, these fields will be null.
 * After applying the migration, add these columns to the TX_COLS select string:
 *   payment_type_id, card_brand, card_last_four
 */

const TX_COLS_BASE =
  'id, company_id, gross_amount, currency, status, created_at, paid_at, subscriptions(current_period_end)';
const TX_COLS_WITH_CARD =
  'id, company_id, gross_amount, currency, status, created_at, paid_at, payment_type_id, card_brand, card_last_four, subscriptions(current_period_end)';

// Cached result of whether card detail columns exist in the DB schema
let cardColumnsAvailable: boolean | null = null;

async function probeCardColumns(): Promise<boolean> {
  if (cardColumnsAvailable !== null) return cardColumnsAvailable;
  const { error } = await supabase.from('payment_transactions').select('payment_type_id').limit(0);
  cardColumnsAvailable = !error;
  return cardColumnsAvailable;
}

function mapTxRow(row: PaymentTxRow, companyName: string): AdminPaymentRow {
  const paymentTypeId = row.payment_type_id || null;
  let paymentMethod: AdminPaymentRow['paymentMethod'] = 'card';
  if (paymentTypeId === 'credit_card' || paymentTypeId === 'debit_card') {
    paymentMethod = paymentTypeId;
  }
  return {
    id: row.id,
    companyId: row.company_id,
    companyName,
    amount: row.gross_amount || 0,
    periodStart: row.paid_at || row.created_at,
    periodEnd: row.subscriptions?.current_period_end || '',
    status: row.status === 'completed' || row.status === 'approved' ? 'approved' : 'pending',
    createdAt: row.created_at,
    rejectionReason: null,
    receiptUrl: null,
    paymentMethod,
    cardBrand: row.card_brand || null,
    cardLastFour: row.card_last_four || null,
  };
}

/**
 * Fetch payment_transactions, gracefully falling back if card columns don't exist yet.
 */
async function queryTransactions(filters?: {
  status?: string[];
  companyId?: string;
  limit?: number;
}) {
  const hasCard = await probeCardColumns();
  const cols = hasCard ? TX_COLS_WITH_CARD : TX_COLS_BASE;

  // The column list is dynamic (with/without card fields); cast to PaymentTxRow[]
  // Both TX_COLS_BASE and TX_COLS_WITH_CARD are supersets of the fields in PaymentTxRow
  let q = supabase.from('payment_transactions').select(cols);
  if (filters?.status) q = q.in('status', filters.status);
  if (filters?.companyId) q = q.eq('company_id', filters.companyId);
  q = q.order('created_at', { ascending: false });
  if (filters?.limit) q = q.limit(filters.limit);
  const result = await q;
  return { data: (result.data ?? null) as PaymentTxRow[] | null, error: result.error };
}

/**
 * Fetch pending bank transfer payments.
 */
export const getPendingPayments = async (): Promise<AdminPaymentRow[]> => {
  const { data, error } = await supabase
    .from('manual_payments')
    .select(
      'id, company_id, amount, period_start, period_end, status, created_at, rejection_reason, receipt_url'
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) handleSupabaseError(error);
  if (!data || data.length === 0) return [];

  // Fetch company names for all pending payments
  const companyIds: string[] = Array.from(new Set<string>(data.map((r) => String(r.company_id))));
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .in('id', companyIds);

  const companyMap = new Map((companies || []).map((c) => [c.id, c.name]));

  return data.map((row) => ({
    id: row.id,
    companyId: row.company_id,
    companyName: companyMap.get(row.company_id) || 'Desconocido',
    amount: row.amount,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    status: row.status as AdminPaymentRow['status'],
    createdAt: row.created_at,
    rejectionReason: row.rejection_reason,
    receiptUrl: row.receipt_url || null,
    paymentMethod: 'bank_transfer',
    cardBrand: null,
    cardLastFour: null,
  }));
};

/**
 * Fetch ALL bank transfer payments (all statuses).
 */
export const getAllPayments = async (): Promise<AdminPaymentRow[]> => {
  // Fetch manual (bank transfer) payments
  const { data: manualData, error } = await supabase
    .from('manual_payments')
    .select(
      'id, company_id, amount, period_start, period_end, status, created_at, rejection_reason, receipt_url'
    )
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error);

  // Fetch MercadoPago card payments (join subscriptions for period end)
  const { data: txData } = await queryTransactions();

  // Collect all company IDs from both sources
  const allCompanyIds: string[] = Array.from(
    new Set<string>([
      ...(manualData || []).map((r) => String(r.company_id)),
      ...(txData || []).map((r) => String(r.company_id)),
    ])
  );

  let companyMap = new Map<string, string>();
  if (allCompanyIds.length > 0) {
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .in('id', allCompanyIds);
    companyMap = new Map((companies || []).map((c) => [c.id, c.name]));
  }

  const manualRows: AdminPaymentRow[] = (manualData || []).map((row) => ({
    id: row.id,
    companyId: row.company_id,
    companyName: companyMap.get(row.company_id) || 'Desconocido',
    amount: row.amount,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    status: row.status as AdminPaymentRow['status'],
    createdAt: row.created_at,
    rejectionReason: row.rejection_reason,
    receiptUrl: row.receipt_url || null,
    paymentMethod: 'bank_transfer',
    cardBrand: null,
    cardLastFour: null,
  }));

  const txRows: AdminPaymentRow[] = (txData || []).map((row) =>
    mapTxRow(row, companyMap.get(row.company_id) || 'Desconocido')
  );

  // Merge and sort by date descending
  return [...manualRows, ...txRows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Get a signed URL for a payment receipt from Supabase Storage.
 */
export const getReceiptSignedUrl = async (path: string): Promise<string> => {
  // Strip bucket prefix if the path includes it
  const cleanPath = path.startsWith('receipts/') ? path.replace('receipts/', '') : path;

  const { data, error } = await supabase.storage.from('receipts').createSignedUrl(cleanPath, 300); // 5 min

  if (error) handleSupabaseError(error);
  return data!.signedUrl;
};

/**
 * Approve a bank transfer payment.
 * Delegates to the admin_approve_payment RPC which atomically:
 * - marks the payment approved
 * - activates the company's subscription (idempotent: update approval_pending or insert)
 * - updates company status
 * - logs the action
 * - sends a notification
 */
export const approvePayment = async (paymentId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase.rpc('admin_approve_payment', {
    p_payment_id: paymentId,
    p_admin_id: user.id,
    p_admin_email: user.email ?? '',
  });

  if (error) handleSupabaseError(error);
};

/**
 * Reject a bank transfer payment.
 * Delegates to the admin_reject_payment RPC which atomically:
 * - marks the payment rejected with reason
 * - logs the action
 * - sends a notification
 */
export const rejectPayment = async (paymentId: string, reason: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase.rpc('admin_reject_payment', {
    p_payment_id: paymentId,
    p_admin_id: user.id,
    p_admin_email: user.email ?? '',
    p_reason: reason || undefined,
  });

  if (error) handleSupabaseError(error);
};

/**
 * Fetch recent sales/transactions (approved payments + MercadoPago transactions).
 */
export const getRecentSales = async (limit = 10): Promise<AdminPaymentRow[]> => {
  // Approved manual payments
  const { data: manualData, error: e1 } = await supabase
    .from('manual_payments')
    .select(
      'id, company_id, amount, period_start, period_end, status, created_at, rejection_reason, receipt_url, reviewed_at'
    )
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false })
    .limit(limit);

  if (e1) handleSupabaseError(e1);

  // Also fetch from payment_transactions (MercadoPago card payments)
  const { data: txData } = await queryTransactions({
    status: ['approved', 'completed'],
    limit,
  });

  // Collect all company IDs from both sources
  const allCompanyIds: string[] = Array.from(
    new Set<string>([
      ...(manualData || []).map((r) => String(r.company_id)),
      ...(txData || []).map((r) => String(r.company_id)),
    ])
  );

  let companyMap = new Map<string, string>();
  if (allCompanyIds.length > 0) {
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .in('id', allCompanyIds);
    companyMap = new Map((companies || []).map((c) => [c.id, c.name]));
  }

  const manualRows: AdminPaymentRow[] = (manualData || []).map((row) => ({
    id: row.id,
    companyId: row.company_id,
    companyName: companyMap.get(row.company_id) || 'Desconocido',
    amount: row.amount,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    status: row.status as AdminPaymentRow['status'],
    createdAt: row.reviewed_at || row.created_at,
    rejectionReason: row.rejection_reason,
    receiptUrl: row.receipt_url || null,
    paymentMethod: 'bank_transfer',
    cardBrand: null,
    cardLastFour: null,
  }));

  const txRows: AdminPaymentRow[] = (txData || []).map((row) => {
    const mapped = mapTxRow(row, companyMap.get(row.company_id) || 'Desconocido');
    mapped.status = 'approved';
    return mapped;
  });

  // Merge, sort by date descending, and take limit
  return [...manualRows, ...txRows]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

/**
 * Fetch payment history for a school (manual payments + MercadoPago transactions).
 */
export const getSchoolPaymentHistory = async (companyId: string): Promise<AdminPaymentRow[]> => {
  // Fetch manual (bank transfer) payments
  const { data: manualData } = await supabase
    .from('manual_payments')
    .select(
      'id, company_id, amount, period_start, period_end, status, created_at, rejection_reason, receipt_url'
    )
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  const manualRows: AdminPaymentRow[] = (manualData || []).map((row) => ({
    id: row.id,
    companyId: row.company_id,
    companyName: '',
    amount: row.amount,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    status: row.status as AdminPaymentRow['status'],
    createdAt: row.created_at,
    rejectionReason: row.rejection_reason,
    receiptUrl: row.receipt_url || null,
    paymentMethod: 'bank_transfer',
    cardBrand: null,
    cardLastFour: null,
  }));

  // Fetch MercadoPago transactions
  const { data: txData } = await queryTransactions({ companyId });

  const txRows: AdminPaymentRow[] = (txData || []).map((row) => {
    const mapped = mapTxRow(row, '');
    const st = row.status;
    mapped.status =
      st === 'approved' || st === 'completed'
        ? 'approved'
        : st === 'pending'
          ? 'pending'
          : 'rejected';
    return mapped;
  });

  // Merge and sort by date descending
  return [...manualRows, ...txRows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
