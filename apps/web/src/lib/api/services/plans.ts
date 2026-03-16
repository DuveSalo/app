import { supabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/utils/errors';
import type { SubscriptionPlanRow } from '@/features/admin/types';

/**
 * Fetch all active subscription plans from DB.
 * Uses anon key (no auth required) — RLS allows anon to read active plans.
 */
export async function getActivePlans(): Promise<SubscriptionPlanRow[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select(
      'id, key, name, price, features, is_active, sort_order, description, tag, highlighted, created_at'
    )
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) handleSupabaseError(error);

  return (data || []).map((row) => ({
    id: row.id,
    key: row.key,
    name: row.name,
    price: row.price,
    features: (row.features || []) as string[],
    isActive: row.is_active,
    sortOrder: row.sort_order,
    description: row.description || '',
    tag: row.tag,
    highlighted: row.highlighted ?? false,
    createdAt: row.created_at,
  }));
}
