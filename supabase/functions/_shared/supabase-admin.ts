/**
 * Supabase admin client using service_role key.
 * Used by webhooks and CRON functions that need to bypass RLS.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getSupabaseSecretKey } from './supabase-keys.ts';

export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  getSupabaseSecretKey(),
);
