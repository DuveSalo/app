import { supabase } from '../../../supabase/client';
import { handleSupabaseError } from '../../../utils/errors';
import type { AdminStats } from '../../../../features/admin/types';

/**
 * Fetch aggregate stats for the admin dashboard.
 * All queries go through RLS which requires admin role.
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  // Active schools (subscribed)
  const { count: activeCount, error: e1 } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .eq('is_subscribed', true);
  if (e1) handleSupabaseError(e1);

  // Pending bank transfer payments
  const { count: pendingCount, error: e2 } = await supabase
    .from('manual_payments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
  if (e2) handleSupabaseError(e2);

  // Rejected bank transfer payments (this month)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: rejectedCount, error: e3 } = await supabase
    .from('manual_payments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'rejected')
    .gte('created_at', startOfMonth.toISOString());
  if (e3) handleSupabaseError(e3);

  // Monthly revenue from approved manual payments
  const { data: approvedPayments, error: e4 } = await supabase
    .from('manual_payments')
    .select('amount')
    .eq('status', 'approved')
    .gte('reviewed_at', startOfMonth.toISOString());
  if (e4) handleSupabaseError(e4);

  // Also try payment_transactions (MercadoPago)
  const { data: transactions } = await supabase
    .from('payment_transactions')
    .select('gross_amount')
    .in('status', ['approved', 'completed'])
    .gte('created_at', startOfMonth.toISOString());

  const txRevenue = (transactions || []).reduce(
    (sum, t) => sum + (t.gross_amount || 0),
    0
  );

  const manualRevenue = (approvedPayments || []).reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  return {
    activeSchools: activeCount ?? 0,
    pendingPayments: pendingCount ?? 0,
    rejectedPayments: rejectedCount ?? 0,
    monthlyRevenue: manualRevenue + txRevenue,
  };
};
