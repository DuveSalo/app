/**
 * MercadoPago plan ID mapping and metadata.
 * Plan IDs (preapproval_plan) are created via API/script and stored as env secrets.
 * Mirrors the structure of paypal-plans.ts.
 */

export interface MpPlanMetadata {
  name: string;
  amount: number;
  currency: string;
}

export const MP_PLAN_METADATA: Record<string, MpPlanMetadata> = {
  basic: { name: 'Basic', amount: 25000, currency: 'ARS' },
  standard: { name: 'Standard', amount: 49000, currency: 'ARS' },
  premium: { name: 'Premium', amount: 89000, currency: 'ARS' },
};

export function isValidMpPlanKey(key: string): key is keyof typeof MP_PLAN_METADATA {
  return key in MP_PLAN_METADATA;
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
