/**
 * Supabase admin client using service_role key.
 * Used by webhooks and CRON functions that need to bypass RLS.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);
