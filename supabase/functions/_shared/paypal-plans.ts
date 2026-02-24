/**
 * PayPal plan ID mapping and metadata.
 * Plan IDs are pre-created in PayPal Dashboard and stored as env secrets.
 */

export interface PlanMetadata {
  name: string;
  amount: number;
  currency: string;
}

export const PLAN_METADATA: Record<string, PlanMetadata> = {
  basic: { name: 'Basic', amount: 25, currency: 'USD' },
  standard: { name: 'Standard', amount: 49, currency: 'USD' },
  premium: { name: 'Premium', amount: 89, currency: 'USD' },
};

export function isValidPlanKey(key: string): key is keyof typeof PLAN_METADATA {
  return key in PLAN_METADATA;
}

const PLAN_ENV_MAP: Record<string, string> = {
  basic: 'PAYPAL_PLAN_ID_BASIC',
  standard: 'PAYPAL_PLAN_ID_STANDARD',
  premium: 'PAYPAL_PLAN_ID_PREMIUM',
};

export function getPayPalPlanId(planKey: string): string {
  const envVar = PLAN_ENV_MAP[planKey];
  if (!envVar) {
    throw new Error(`Unknown plan key: ${planKey}`);
  }
  const planId = Deno.env.get(envVar);
  if (!planId) {
    throw new Error(`Missing env var ${envVar} for plan "${planKey}"`);
  }
  return planId;
}
