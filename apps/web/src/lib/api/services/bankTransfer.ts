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
 * Submit a bank transfer payment (creates a manual_payment record + updates company).
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

  // Create manual payment record
  const { data, error } = await db
    .from('manual_payments')
    .insert({
      company_id: params.companyId,
      amount: params.amount,
      period_start: periodStart,
      period_end: periodEnd,
      status: 'pending',
    })
    .select()
    .single();

  if (error) handleSupabaseError(error);

  // Update company payment method and plan
  const { error: updateError } = await supabase
    .from('companies')
    .update({
      payment_method: 'bank_transfer',
      bank_transfer_status: 'pending',
      selected_plan: params.planKey,
      subscription_status: 'pending',
    } as any)
    .eq('id', params.companyId);

  if (updateError) handleSupabaseError(updateError);

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

  // Update manual_payment with receipt info
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
