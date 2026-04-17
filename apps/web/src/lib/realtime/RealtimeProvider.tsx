import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { USER_TABLES, ADMIN_TABLES } from './tableQueryMap';

interface RealtimeProviderProps {
  children: ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { currentUser, currentCompany, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUser) return;

    const companyId = currentCompany?.id ?? null;

    // Regular users require a company before subscribing
    if (!isAdmin && !companyId) return;

    const channelName = isAdmin ? 'realtime:admin' : `realtime:${companyId}`;
    const channel = supabase.channel(channelName);
    const tables = isAdmin ? ADMIN_TABLES : USER_TABLES;

    for (const config of tables) {
      const filter =
        config.filterColumn && companyId
          ? { filter: `${config.filterColumn}=eq.${companyId}` }
          : {};

      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: config.table, ...filter },
        (payload) => {
          console.log(`[Realtime] Change on ${config.table}:`, payload.eventType);
          config.getQueryKeys(companyId).forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key as unknown[] });
          });
        }
      );
    }

    channel.subscribe((status) => {
      console.log(`[Realtime] Channel ${channelName} status: ${status}`);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, currentCompany?.id, isAdmin, queryClient]);

  return <>{children}</>;
}
