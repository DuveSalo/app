import { supabase } from '../../supabase/client';
import { handleSupabaseError } from '../../utils/errors';

const db = supabase as any;

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

  const { data, error: fetchError } = await db
    .from('manual_payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (fetchError) handleSupabaseError(fetchError);

  return {
    id: data.id,
    companyId: data.company_id,
    amount: data.amount,
    periodStart: data.period_start,
    periodEnd: data.period_end,
    receiptUrl: data.receipt_url,
    receiptUploadedAt: data.receipt_uploaded_at,
    status: data.status,
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

  const { error: updateError } = await db
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
  const { data, error } = await db
    .from('manual_payments')
    .select('*')
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
    status: data.status,
    rejectionReason: data.rejection_reason,
    createdAt: data.created_at,
  };
}
