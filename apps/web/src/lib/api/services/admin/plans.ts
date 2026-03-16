import { supabase } from '../../../supabase/client';
import { handleSupabaseError } from '../../../utils/errors';
import type { SubscriptionPlanRow } from '../../../../features/admin/types';

/**
 * Fetch all subscription plans.
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlanRow[]> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('id, key, name, price, features, is_active, sort_order, description, tag, highlighted, created_at')
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
};

/**
 * Create a subscription plan.
 */
export const createSubscriptionPlan = async (plan: {
  key: string;
  name: string;
  price: number;
  features: string[];
  sortOrder: number;
  description: string;
  tag: string | null;
  highlighted: boolean;
}): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('subscription_plans')
    .insert({
      key: plan.key,
      name: plan.name,
      price: plan.price,
      features: plan.features,
      sort_order: plan.sortOrder,
      description: plan.description,
      tag: plan.tag,
      highlighted: plan.highlighted,
    })
    .select('id')
    .single();

  if (error) handleSupabaseError(error);

  // Log action
  await supabase.from('activity_logs').insert({
    admin_id: user.id,
    action: 'create_plan',
    target_type: 'subscription_plan',
    target_id: data!.id,
    metadata: { name: plan.name, price: plan.price },
  });
};

/**
 * Update a subscription plan.
 */
export const updateSubscriptionPlan = async (
  planId: string,
  plan: {
    name: string;
    price: number;
    features: string[];
    sortOrder: number;
    description: string;
    tag: string | null;
    highlighted: boolean;
  }
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('subscription_plans')
    .update({
      name: plan.name,
      price: plan.price,
      features: plan.features,
      sort_order: plan.sortOrder,
      description: plan.description,
      tag: plan.tag,
      highlighted: plan.highlighted,
    })
    .eq('id', planId);

  if (error) handleSupabaseError(error);

  await supabase.from('activity_logs').insert({
    admin_id: user.id,
    action: 'update_plan',
    target_type: 'subscription_plan',
    target_id: planId,
    metadata: { name: plan.name, price: plan.price },
  });
};

/**
 * Toggle a subscription plan's active status.
 */
export const toggleSubscriptionPlan = async (planId: string, isActive: boolean): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('subscription_plans')
    .update({ is_active: isActive })
    .eq('id', planId);

  if (error) handleSupabaseError(error);

  await supabase.from('activity_logs').insert({
    admin_id: user.id,
    action: 'toggle_plan',
    target_type: 'subscription_plan',
    target_id: planId,
    metadata: { is_active: isActive },
  });
};

/**
 * Delete a subscription plan.
 */
export const deleteSubscriptionPlan = async (planId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  // Log before delete
  await supabase.from('activity_logs').insert({
    admin_id: user.id,
    action: 'delete_plan',
    target_type: 'subscription_plan',
    target_id: planId,
  });

  const { error } = await supabase
    .from('subscription_plans')
    .delete()
    .eq('id', planId);

  if (error) handleSupabaseError(error);
};
