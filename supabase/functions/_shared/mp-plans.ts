/**
 * MercadoPago plan ID mapping and metadata.
 * Plan IDs (preapproval_plan) are created via API/script and stored as env secrets.
 * Plan metadata is fetched from the subscription_plans DB table (single source of truth).
 */

import { supabaseAdmin } from './supabase-admin.ts';

export interface MpPlanMetadata {
  name: string;
  amount: number;
  currency: string;
}

/**
 * Fetch plan metadata from the subscription_plans table.
 * Converts centavos (DB) to pesos (MercadoPago transaction_amount).
 */
export async function getPlanMetadataFromDb(planKey: string): Promise<MpPlanMetadata> {
  const { data, error } = await supabaseAdmin
    .from('subscription_plans')
    .select('name, price, key')
    .eq('key', planKey)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error(`Plan not found or inactive: ${planKey}`);
  }

  return {
    name: data.name,
    amount: data.price / 100, // centavos → pesos
    currency: 'ARS',
  };
}

/**
 * Validate that a plan key exists in the database.
 */
export async function isValidPlanKey(key: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('subscription_plans')
    .select('key')
    .eq('key', key)
    .eq('is_active', true)
    .single();

  return !!data;
}

const MP_PLAN_ENV_MAP: Record<string, string> = {
  basic: 'MP_PLAN_ID_BASIC',
  standard: 'MP_PLAN_ID_STANDARD',
  premium: 'MP_PLAN_ID_PREMIUM',
};

export function getMpPlanId(planKey: string): string {
  const envVar = MP_PLAN_ENV_MAP[planKey];
  if (!envVar) {
    throw new Error(`Unknown MP plan key: ${planKey}`);
  }
  const planId = Deno.env.get(envVar);
  if (!planId) {
    throw new Error(`Missing env var ${envVar} for MP plan "${planKey}"`);
  }
  return planId;
}
