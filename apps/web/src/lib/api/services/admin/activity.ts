import { supabase } from '../../../supabase/client';
import { handleSupabaseError } from '../../../utils/errors';
import type { ActivityLogRow } from '../../../../features/admin/types';

/**
 * Fetch activity logs for the admin panel.
 */
export const getActivityLogs = async (): Promise<ActivityLogRow[]> => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('id, admin_id, action, target_type, target_id, metadata, created_at')
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error);
  if (!data || data.length === 0) return [];

  // Fetch admin info from employees table
  const adminIds: string[] = Array.from(
    new Set<string>(data.filter((r) => r.admin_id).map((r) => String(r.admin_id)))
  );
  const { data: employees } =
    adminIds.length > 0
      ? await supabase.from('employees').select('id, email, name').in('id', adminIds)
      : { data: [] as { id: string; email: string; name: string }[] };

  const adminMap = new Map<string, string>(
    (employees || []).map((e) => [e.id, e.email || e.name || 'Admin'])
  );

  return data.map((row) => {
    // Type-narrow metadata: Json | null can be object, array, string, number, boolean, or null.
    // We only access properties if it's a plain object (not an array, not null).
    const meta =
      typeof row.metadata === 'object' && !Array.isArray(row.metadata) && row.metadata !== null
        ? (row.metadata as Record<string, unknown>)
        : null;

    return {
      id: row.id,
      adminId: row.admin_id || '',
      adminEmail: row.admin_id
        ? adminMap.get(row.admin_id) || 'Admin'
        : meta?.user_email
          ? String(meta.user_email)
          : 'Sistema',
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      metadata: meta ?? {},
      createdAt: row.created_at,
    };
  });
};
