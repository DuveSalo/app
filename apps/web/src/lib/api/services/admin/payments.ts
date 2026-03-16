import { supabase } from '../../../supabase/client';
import { handleSupabaseError } from '../../../utils/errors';
import { formatPlanName } from '../../../../constants/plans';
import type {
  AdminPaymentRow,
  AdminSaleRow,
} from '../../../../features/admin/types';

/**
 * Fetch pending bank transfer payments.
 */
export const getPendingPayments = async (): Promise<AdminPaymentRow[]> => {
  const { data, error } = await supabase
    .from('manual_payments')
    .select('id, company_id, amount, period_start, period_end, status, created_at, rejection_reason, receipt_url')
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

  // Fetch company names for all payments
  const companyIds: string[] = Array.from(
    new Set<string>(data.map((r) => String(r.company_id)))
  );
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
  return data!.signedUrl;
};

/**
 * Approve a bank transfer payment.
 */
export const approvePayment = async (paymentId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('manual_payments')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', paymentId);

  if (error) handleSupabaseError(error);

  // Fetch the payment to get company_id for activation and audit metadata
  const { data: payment } = await supabase
    .from('manual_payments')
    .select('company_id')
    .eq('id', paymentId)
    .single();

  // Log the action (include company_id for audit trail)
  const { error: logError } = await supabase.from('activity_logs').insert({
    admin_id: user.id,
    action: 'approve_payment',
    target_type: 'manual_payment',
    target_id: paymentId,
    metadata: { company_id: payment?.company_id ?? null },
  });
  if (logError) console.error('Failed to log approve_payment:', logError);

  if (payment) {
    await supabase
      .from('companies')
      .update({
        is_subscribed: true,
        subscription_status: 'active',
        bank_transfer_status: 'active',
      })
      .eq('id', payment.company_id);

    // Notify the company that their payment was approved
    await supabase.from('notifications').insert({
      company_id: payment.company_id,
      type: 'system',
      category: 'system',
      title: 'Pago aprobado',
      message: 'Tu transferencia bancaria fue aprobada. Tu suscripcion esta activa.',
      link: '/bank-transfer/status',
      related_table: 'manual_payments',
      related_id: paymentId,
      is_read: false,
    });
  }
};

/**
 * Reject a bank transfer payment.
 */
export const rejectPayment = async (
  paymentId: string,
  reason: string
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('manual_payments')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', paymentId);

  if (error) handleSupabaseError(error);

  // Log the action
  const { error: logError } = await supabase.from('activity_logs').insert({
    admin_id: user.id,
    action: 'reject_payment',
    target_type: 'manual_payment',
    target_id: paymentId,
    metadata: { reason },
  });
  if (logError) console.error('Failed to log reject_payment:', logError);

  // Notify the company that their payment was rejected
  const { data: payment } = await supabase
    .from('manual_payments')
    .select('company_id')
    .eq('id', paymentId)
    .single();

  if (payment) {
    await supabase.from('notifications').insert({
      company_id: payment.company_id,
      type: 'info',
      category: 'system',
      title: 'Pago rechazado',
      message: reason
        ? `Tu transferencia fue rechazada: ${reason}`
        : 'Tu transferencia bancaria fue rechazada. Por favor subi un nuevo comprobante.',
      link: '/bank-transfer/status',
      related_table: 'manual_payments',
      related_id: paymentId,
      is_read: false,
    });
  }
};

/**
 * Fetch recent sales/transactions (approved payments + MercadoPago transactions).
 */
export const getRecentSales = async (limit = 10): Promise<AdminSaleRow[]> => {
  // Approved manual payments
  const { data: manualData, error: e1 } = await supabase
    .from('manual_payments')
    .select('id, amount, reviewed_at, company_id')
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false })
    .limit(limit);

  if (e1) handleSupabaseError(e1);

  // Fetch company info for manual payments
  const companyIds: string[] = Array.from(new Set<string>((manualData || []).map((r) => String(r.company_id))));
  let companyMap = new Map<string, { name: string; plan: string }>();
  if (companyIds.length > 0) {
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, selected_plan')
      .in('id', companyIds);
    companyMap = new Map(
      (companies || []).map((c) => [c.id, { name: c.name, plan: formatPlanName(c.selected_plan) }])
    );
  }

  const sales: AdminSaleRow[] = (manualData || []).map((row) => {
    const company = companyMap.get(row.company_id);
    return {
      id: row.id,
      companyName: company?.name || 'Desconocido',
      plan: company?.plan || 'Sin plan',
      amount: row.amount,
      status: 'Transferencia',
      date: row.reviewed_at || '',
    };
  });

  // Also fetch from payment_transactions if table exists
  const { data: txData } = await supabase
    .from('payment_transactions')
    .select('id, gross_amount, created_at, status')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (txData) {
    for (const tx of txData) {
      sales.push({
        id: tx.id,
        companyName: '-',
        plan: '-',
        amount: tx.gross_amount || 0,
        status: 'MercadoPago',
        date: tx.created_at,
      });
    }
  }

  // Sort by date descending and take limit
  sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sales.slice(0, limit);
};

/**
 * Fetch payment history for a school (manual payments + MercadoPago transactions).
 */
export const getSchoolPaymentHistory = async (companyId: string): Promise<AdminPaymentRow[]> => {
  // Fetch manual (bank transfer) payments
  const { data: manualData } = await supabase
    .from('manual_payments')
    .select('id, company_id, amount, period_start, period_end, status, created_at, rejection_reason, receipt_url')
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
  }));

  // Fetch MercadoPago transactions
  const { data: txData } = await supabase
    .from('payment_transactions')
    .select('id, company_id, gross_amount, status, created_at, paid_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  const txRows: AdminPaymentRow[] = (txData || []).map((row) => ({
    id: row.id,
    companyId: row.company_id,
    companyName: '',
    amount: row.gross_amount || 0,
    periodStart: row.paid_at || row.created_at,
    periodEnd: '',
    status: row.status === 'approved' ? 'approved' : row.status === 'pending' ? 'pending' : 'rejected',
    createdAt: row.created_at,
    rejectionReason: null,
    receiptUrl: null,
  }));

  // Merge and sort by date descending
  return [...manualRows, ...txRows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
