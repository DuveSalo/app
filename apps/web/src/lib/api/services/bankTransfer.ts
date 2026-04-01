import { supabase } from '../../supabase/client';
import { handleSupabaseError, DatabaseError } from '../../utils/errors';

export interface ManualPayment {
  id: string;
  companyId: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  receiptUrl: string | null;
  receiptUploadedAt: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  createdAt: string;
}

/**
 * Submit a bank transfer payment.
 * Atomically creates a manual_payment, updates the company, and inserts an
 * approval_pending subscription — all via the submit_bank_transfer_payment RPC.
 */
export async function submitBankTransferPayment(params: {
  companyId: string;
  planKey: string;
  amount: number;
}): Promise<ManualPayment> {
  const now = new Date();
  const periodStart = now.toISOString().split('T')[0];
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    .toISOString()
    .split('T')[0];

  const { data: paymentId, error } = await supabase.rpc('submit_bank_transfer_payment', {
    p_company_id: params.companyId,
    p_amount: params.amount,
    p_period_start: periodStart,
    p_period_end: periodEnd,
    p_plan_key: params.planKey,
  });

  if (error) handleSupabaseError(error);
  if (!paymentId) throw new DatabaseError('Error al crear el pago: ID no retornado');

  const { data, error: fetchError } = await supabase
    .from('manual_payments')
    .select(
      'id, company_id, amount, period_start, period_end, receipt_url, receipt_uploaded_at, status, rejection_reason, created_at'
    )
    .eq('id', paymentId)
    .single();

  if (fetchError) handleSupabaseError(fetchError);
  if (!data) throw new DatabaseError('Error al obtener el pago creado');

  return {
    id: data.id,
    companyId: data.company_id,
    amount: data.amount,
    periodStart: data.period_start,
    periodEnd: data.period_end,
    receiptUrl: data.receipt_url,
    receiptUploadedAt: data.receipt_uploaded_at,
    status: data.status as ManualPayment['status'],
    rejectionReason: data.rejection_reason,
    createdAt: data.created_at,
  };
}

/**
 * Upload receipt file to Supabase Storage and update the manual_payment record.
 */
export async function uploadReceipt(params: {
  companyId: string;
  paymentId: string;
  file: File;
}): Promise<string> {
  const fileExt = params.file.name.split('.').pop();
  const filePath = `${params.companyId}/${params.paymentId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(filePath, params.file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { error: updateError } = await supabase
    .from('manual_payments')
    .update({
      receipt_url: filePath,
      receipt_uploaded_at: new Date().toISOString(),
    })
    .eq('id', params.paymentId);

  if (updateError) handleSupabaseError(updateError);

  return filePath;
}

/**
 * Get the latest manual payment for a company.
 */
export async function getLatestManualPayment(companyId: string): Promise<ManualPayment | null> {
  const { data, error } = await supabase
    .from('manual_payments')
    .select(
      'id, company_id, amount, period_start, period_end, receipt_url, receipt_uploaded_at, status, rejection_reason, created_at'
    )
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) handleSupabaseError(error);
  if (!data) return null;

  return {
    id: data.id,
    companyId: data.company_id,
    amount: data.amount,
    periodStart: data.period_start,
    periodEnd: data.period_end,
    receiptUrl: data.receipt_url,
    receiptUploadedAt: data.receipt_uploaded_at,
    status: data.status as ManualPayment['status'],
    rejectionReason: data.rejection_reason,
    createdAt: data.created_at,
  };
}
