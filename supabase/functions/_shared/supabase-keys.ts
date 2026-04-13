/**
 * Supabase API key helpers.
 *
 * Supabase is migrating from legacy JWT-based `anon`/`service_role` keys to
 * publishable (`sb_publishable_...`) and secret (`sb_secret_...`) API keys.
 * New keys are not exposed to Edge Functions automatically yet, so set them as
 * project secrets using the SB_ prefix.
 */

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function getSupabasePublishableKey(): string {
  return (
    Deno.env.get('SB_PUBLISHABLE_KEY')?.trim() ||
    Deno.env.get('SUPABASE_ANON_KEY')?.trim() ||
    requiredEnv('SB_PUBLISHABLE_KEY')
  );
}

export function getSupabaseSecretKey(): string {
  return (
    Deno.env.get('SB_SECRET_KEY')?.trim() ||
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ||
    requiredEnv('SB_SECRET_KEY')
  );
}
