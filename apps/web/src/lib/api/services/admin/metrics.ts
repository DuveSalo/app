import { supabase } from '../../../supabase/client';
import { handleSupabaseError } from '../../../utils/errors';
import type { MetricsSummary, MonthlyMetric } from '../../../../features/admin/types';

/**
 * Fetch metrics summary for the admin metrics page.
 */
export const getMetricsSummary = async (): Promise<MetricsSummary> => {
  // Active schools
  const { count: activeCount, error: e1 } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .eq('is_subscribed', true);
  if (e1) handleSupabaseError(e1);

  // New registrations this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: newCount, error: e2 } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());
  if (e2) handleSupabaseError(e2);

  // Total companies for retention calculation
  const { count: totalCount, error: e3 } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true });
  if (e3) handleSupabaseError(e3);

  const total = totalCount ?? 0;
  const active = activeCount ?? 0;
  const retentionRate = total > 0 ? Math.round((active / total) * 100) : 0;

  // Monthly revenue (same logic as getAdminStats)
  const { data: approvedPayments, error: e4 } = await supabase
    .from('manual_payments')
    .select('amount')
    .eq('status', 'approved')
    .gte('reviewed_at', startOfMonth.toISOString());
  if (e4) handleSupabaseError(e4);

  const { data: transactions } = await supabase
    .from('payment_transactions')
    .select('gross_amount')
    .in('status', ['approved', 'completed'])
    .gte('created_at', startOfMonth.toISOString());

  const manualRevenue = (approvedPayments || []).reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );
  const txRevenue = (transactions || []).reduce(
    (sum, t) => sum + (t.gross_amount || 0),
    0
  );

  return {
    totalActive: active,
    newRegistrations: newCount ?? 0,
    retentionRate,
    monthlyRevenue: manualRevenue + txRevenue,
  };
};

/**
 * Fetch monthly metrics for charts (last 6 months).
 * All months are fetched in parallel to avoid slow sequential loading.
 */
export const getMonthlyMetrics = async (): Promise<MonthlyMetric[]> => {
  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];

  const now = new Date();

  const fetchMonth = async (i: number): Promise<MonthlyMetric> => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.toISOString();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
    const label = monthNames[d.getMonth()];

    const [regResult, activeResult, cancelledResult, paymentsResult, txsResult] =
      await Promise.all([
        supabase
          .from('companies')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', start)
          .lt('created_at', end),
        supabase
          .from('companies')
          .select('id', { count: 'exact', head: true })
          .eq('is_subscribed', true)
          .lt('created_at', end),
        supabase
          .from('companies')
          .select('id', { count: 'exact', head: true })
          .in('subscription_status', ['cancelled', 'suspended'])
          .lt('created_at', end),
        supabase
          .from('manual_payments')
          .select('amount')
          .eq('status', 'approved')
          .gte('reviewed_at', start)
          .lt('reviewed_at', end),
        supabase
          .from('payment_transactions')
          .select('gross_amount')
          .in('status', ['approved', 'completed'])
          .gte('created_at', start)
          .lt('created_at', end),
      ]);

    const revenue =
      (paymentsResult.data || []).reduce(
        (s, p) => s + (p.amount || 0),
        0,
      ) +
      (txsResult.data || []).reduce(
        (s, t) => s + (t.gross_amount || 0),
        0,
      );

    return {
      month: label,
      registrations: regResult.count ?? 0,
      active: activeResult.count ?? 0,
      cancelled: cancelledResult.count ?? 0,
      revenue,
    };
  };

  const results = await Promise.all(
    [5, 4, 3, 2, 1, 0].map((i) => fetchMonth(i)),
  );

  return results;
};
