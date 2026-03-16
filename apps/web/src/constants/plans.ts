/**
 * Plan key → display name mapping.
 *
 * The `companies.selected_plan` column stores lowercase keys like "basic",
 * "standard", "premium", "trial". This map provides the user-facing Spanish
 * display names used across the admin panel, subscription pages, and settings.
 *
 * Source of truth: must stay in sync with `plansData` in SubscriptionPage.tsx
 * and `subscription_plans` seed data.
 */
export const PLAN_DISPLAY_NAMES: Record<string, string> = {
  trial: 'Prueba Gratis',
  basic: 'Básico',
  standard: 'Estándar',
  premium: 'Premium',
};

/**
 * Format a plan key (from `companies.selected_plan`) into a human-readable
 * display name. Falls back to capitalizing the first letter if the key is not
 * in the known map (e.g. a plan created via the admin panel).
 */
export function formatPlanName(planKey: string | null | undefined): string {
  if (!planKey) return 'Sin plan';
  return PLAN_DISPLAY_NAMES[planKey] ?? planKey.charAt(0).toUpperCase() + planKey.slice(1);
}
