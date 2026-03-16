import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';
import { env } from '../env';

export const supabase = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Proactively clear corrupt sessions on load (silently)
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ error }) => {
    if (
      error?.message?.includes('Refresh Token Not Found') ||
      error?.message?.includes('Invalid Refresh Token')
    ) {
      supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    }
  });
}
