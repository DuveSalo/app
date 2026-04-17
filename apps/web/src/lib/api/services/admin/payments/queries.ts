import { supabase } from '../../../../supabase/client';
import { handleSupabaseError } from '../../../../utils/errors';
import type { AdminPaymentRow } from '../../../../../features/admin/types';

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
    paymentMethod: 'bank_transfer' as const,
  }));
};

/**
 * Fetch ALL bank transfer payments (all statuses).
 */
export const getAllPayments = async (): Promise<AdminPaymentRow[]> => {
  const { data, error } = await supabase
    .from('manual_payments')
    .select(
      'id, company_id, amount, period_start, period_end, status, created_at, rejection_reason, receipt_url'
    )
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error);
  if (!data || data.length === 0) return [];

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
    paymentMethod: 'bank_transfer' as const,
  }));
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
 * Fetch recent sales/transactions (approved bank transfer payments).
 */
export const getRecentSales = async (limit = 10): Promise<AdminPaymentRow[]> => {
  const { data, error } = await supabase
    .from('manual_payments')
    .select(
      'id, company_id, amount, period_start, period_end, status, created_at, rejection_reason, receipt_url, reviewed_at'
    )
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false })
    .limit(limit);

  if (error) handleSupabaseError(error);
  if (!data || data.length === 0) return [];

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
    createdAt: (row as { reviewed_at?: string | null }).reviewed_at || row.created_at,
    rejectionReason: row.rejection_reason,
    receiptUrl: row.receipt_url || null,
    paymentMethod: 'bank_transfer' as const,
  }));
};

/**
 * Fetch payment history for a school (bank transfer payments only).
 */
export const getSchoolPaymentHistory = async (companyId: string): Promise<AdminPaymentRow[]> => {
  const { data } = await supabase
    .from('manual_payments')
    .select(
      'id, company_id, amount, period_start, period_end, status, created_at, rejection_reason, receipt_url'
    )
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  return (data || []).map((row) => ({
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
    paymentMethod: 'bank_transfer' as const,
  }));
};
