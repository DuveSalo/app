import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';
import { env } from '../env';
import { recoverSupabaseAuthSession as recoverAuthSession } from './authRecovery';

export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'pkce',
      // Supabase auth-js logs invalid refresh-token errors during its initial
      // auto-recovery path. We validate/clear the stored session explicitly
      // before starting managed auto-refresh from AuthContext.
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export const recoverSupabaseAuthSession = () => recoverAuthSession(supabase);

let stopManagedAutoRefresh: (() => void) | null = null;

export const startManagedSupabaseAutoRefresh = (): (() => void) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  if (stopManagedAutoRefresh) {
    return stopManagedAutoRefresh;
  }

  const syncAutoRefreshWithVisibility = () => {
    const refreshAction =
      document.visibilityState === 'visible'
        ? supabase.auth.startAutoRefresh()
        : supabase.auth.stopAutoRefresh();

    refreshAction.catch(() => undefined);
  };

  syncAutoRefreshWithVisibility();
  document.addEventListener('visibilitychange', syncAutoRefreshWithVisibility);

  const stop = () => {
    document.removeEventListener('visibilitychange', syncAutoRefreshWithVisibility);
    supabase.auth.stopAutoRefresh().catch(() => undefined);
    stopManagedAutoRefresh = null;
  };

  stopManagedAutoRefresh = stop;
  return stop;
};
