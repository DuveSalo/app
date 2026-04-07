import { supabase } from '../../../../supabase/client';
import type { AdminPaymentRow } from '../../../../../features/admin/types';
import type { Tables } from '../../../../../types/database.types';

// Base fields always selected from payment_transactions
export type TxBase = Pick<
  Tables<'payment_transactions'>,
  'id' | 'company_id' | 'gross_amount' | 'currency' | 'status' | 'created_at' | 'paid_at'
>;

// Card fields (optional — only present after migration 20260325130000)
export type TxCardFields = Partial<
  Pick<Tables<'payment_transactions'>, 'payment_type_id' | 'card_brand' | 'card_last_four'>
>;

// The joined subscription shape (relational sub-select)
export interface TxSubscriptionJoin {
  subscriptions: { current_period_end: string | null } | null;
}

// Full row type for mapTxRow — one assertion at the data boundary, full types everywhere else
export type PaymentTxRow = TxBase & TxCardFields & TxSubscriptionJoin;

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

export function mapTxRow(row: PaymentTxRow, companyName: string): AdminPaymentRow {
  const sub = row.subscriptions;
  const paymentTypeId = row.payment_type_id ?? null;
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
    periodEnd: sub?.current_period_end || '',
    status: row.status === 'completed' || row.status === 'approved' ? 'approved' : 'pending',
    createdAt: row.created_at,
    rejectionReason: null,
    receiptUrl: null,
    paymentMethod,
    cardBrand: row.card_brand ?? null,
    cardLastFour: row.card_last_four ?? null,
  };
}

/**
 * Fetch payment_transactions, gracefully falling back if card columns don't exist yet.
 */
export async function queryTransactions(filters?: {
  status?: string[];
  companyId?: string;
  limit?: number;
}): Promise<{ data: PaymentTxRow[] | null; error: unknown }> {
  const hasCard = await probeCardColumns();
  const cols = hasCard ? TX_COLS_WITH_CARD : TX_COLS_BASE;

  // cols is dynamic (with/without card columns); Supabase types cannot infer a
  // runtime-determined select string, so we assert once at this boundary.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder = supabase.from('payment_transactions').select(cols) as any;
  let q = builder;
  if (filters?.status) q = q.in('status', filters.status);
  if (filters?.companyId) q = q.eq('company_id', filters.companyId);
  q = q.order('created_at', { ascending: false });
  if (filters?.limit) q = q.limit(filters.limit);
  const result = await q;
  return { data: result.data as PaymentTxRow[] | null, error: result.error };
}
