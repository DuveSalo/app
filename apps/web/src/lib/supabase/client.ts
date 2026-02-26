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

// Handle stale refresh tokens gracefully — clear corrupt session instead of throwing
supabase.auth.onAuthStateChange((event) => {
  if (event === 'TOKEN_REFRESHED') return;
  if (event === 'SIGNED_OUT') return;
});

// Proactively validate the stored session on load
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ error }) => {
    if (error?.message?.includes('Refresh Token Not Found') || error?.message?.includes('Invalid Refresh Token')) {
      supabase.auth.signOut();
    }
  });
}
