import { supabase } from '../../../../supabase/client';
import { handleSupabaseError } from '../../../../utils/errors';
import type { AdminPaymentRow } from '../../../../../features/admin/types';
import { mapTxRow, queryTransactions } from './shared';

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
    mapTxRow(row, companyMap.get(row.company_id as string) || 'Desconocido')
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
  if (!data) throw new Error('No se pudo generar la URL firmada');
  return data.signedUrl;
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
    const mapped = mapTxRow(row, companyMap.get(row.company_id as string) || 'Desconocido');
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
