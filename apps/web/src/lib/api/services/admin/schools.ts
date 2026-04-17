import { supabase } from '../../../supabase/client';
import { handleSupabaseError } from '../../../utils/errors';
import { createLogger } from '../../../utils/logger';
import { formatPlanName } from '../../../../constants/plans';
import type { AdminSchoolRow, AdminSchoolDetail } from '../../../../features/admin/types';

const logger = createLogger('AdminSchoolsService');

/**
 * Resolve the displayed subscription status, falling back to trial state
 * when the company has no active subscription record yet.
 */
function resolveSubscriptionStatus(
  rawStatus: string | null | undefined,
  trialEndsAt: string | null | undefined
): string {
  if (rawStatus) return rawStatus;
  if (trialEndsAt) {
    return new Date(trialEndsAt).getTime() > Date.now() ? 'trial' : 'trial_expired';
  }
  return 'Sin suscripción';
}

/**
 * Fetch recent school registrations (last N).
 */
export const getRecentRegistrations = async (limit = 10): Promise<AdminSchoolRow[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select(
      'id, name, city, province, selected_plan, subscription_status, trial_ends_at, created_at, payment_method, employees(email, role)'
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) handleSupabaseError(error);

  return (data || []).map((row) => {
    const ownerEmail =
      (row.employees || []).find((e) => e.role === 'Administrador')?.email ||
      (row.employees || [])[0]?.email ||
      '';
    return {
      id: row.id,
      name: row.name,
      email: ownerEmail,
      city: row.city,
      province: row.province,
      plan: formatPlanName(row.selected_plan),
      subscriptionStatus: resolveSubscriptionStatus(row.subscription_status, row.trial_ends_at),
      paymentMethod: row.payment_method === 'bank_transfer' ? 'bank_transfer' : null,
      createdAt: row.created_at ?? '',
    };
  });
};

/**
 * Fetch a single school's full details.
 */
export const getSchoolDetail = async (companyId: string): Promise<AdminSchoolDetail> => {
  const { data, error } = await supabase
    .from('companies')
    .select(
      'id, name, cuit, address, city, province, locality, postal_code, phone, selected_plan, subscription_status, payment_method, bank_transfer_status, is_subscribed, trial_ends_at, subscription_renewal_date, created_at, services, employees(id, name, email, role)'
    )
    .eq('id', companyId)
    .single();

  if (error) handleSupabaseError(error);
  if (!data) throw new Error('Escuela no encontrada');

  return {
    id: data.id,
    name: data.name,
    cuit: data.cuit,
    address: data.address,
    city: data.city,
    province: data.province,
    locality: data.locality,
    postalCode: data.postal_code,
    phone: data.phone || '',
    email:
      (data.employees || []).find((e) => e.role === 'Administrador')?.email ||
      (data.employees || [])[0]?.email ||
      '',
    plan: formatPlanName(data.selected_plan),
    subscriptionStatus: resolveSubscriptionStatus(data.subscription_status, data.trial_ends_at),
    paymentMethod: data.payment_method === 'bank_transfer' ? 'bank_transfer' : null,
    bankTransferStatus: data.bank_transfer_status || null,
    isSubscribed: data.is_subscribed || false,
    trialEndsAt: data.trial_ends_at || null,
    subscriptionRenewalDate: data.subscription_renewal_date || null,
    createdAt: data.created_at ?? '',
    employees: (data.employees || []).map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      role: e.role,
    })),
    services: data.services as Record<string, boolean> | null,
  };
};

/**
 * Fetch document counts for a school.
 */
export const getSchoolDocumentCounts = async (
  companyId: string
): Promise<Record<string, number>> => {
  const tables = [
    { key: 'fire_extinguishers', table: 'fire_extinguishers' },
    { key: 'conservation_certificates', table: 'conservation_certificates' },
    { key: 'self_protection_systems', table: 'self_protection_systems' },
    { key: 'qr_documents', table: 'qr_documents' },
    { key: 'events', table: 'events' },
  ] as const;

  const counts: Record<string, number> = {};

  await Promise.all(
    tables.map(async ({ key, table }) => {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId);
      if (!error) counts[key] = count ?? 0;
    })
  );

  return counts;
};

/**
 * Fetch all schools for the admin list.
 */
export const getAllSchools = async (): Promise<AdminSchoolRow[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select(
      'id, name, city, province, selected_plan, subscription_status, trial_ends_at, created_at, payment_method, employees(email, role)'
    )
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error);

  return (data || []).map((row) => {
    const ownerEmail =
      (row.employees || []).find((e) => e.role === 'Administrador')?.email ||
      (row.employees || [])[0]?.email ||
      '';
    return {
      id: row.id,
      name: row.name,
      email: ownerEmail,
      city: row.city,
      province: row.province,
      plan: formatPlanName(row.selected_plan),
      subscriptionStatus: resolveSubscriptionStatus(row.subscription_status, row.trial_ends_at),
      paymentMethod: row.payment_method === 'bank_transfer' ? 'bank_transfer' : null,
      createdAt: row.created_at ?? '',
    };
  });
};

/**
 * Suspend a school (set subscription_status to suspended).
 */
export const suspendSchool = async (companyId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('companies')
    .update({ subscription_status: 'suspended', is_subscribed: false })
    .eq('id', companyId);

  if (error) handleSupabaseError(error);

  const { error: logError } = await supabase.from('activity_logs').insert({
    admin_id: user.id,
    action: 'suspend_school',
    target_type: 'company',
    target_id: companyId,
  });
  if (logError) logger.error('Failed to log suspend_school', logError);
};

/**
 * Activate a school (set subscription_status to active).
 */
export const activateSchool = async (companyId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('companies')
    .update({ subscription_status: 'active', is_subscribed: true })
    .eq('id', companyId);

  if (error) handleSupabaseError(error);

  const { error: logError } = await supabase.from('activity_logs').insert({
    admin_id: user.id,
    action: 'activate_school',
    target_type: 'company',
    target_id: companyId,
  });
  if (logError) logger.error('Failed to log activate_school', logError);
};

/**
 * Delete a school and its associated auth user via Edge Function.
 * The Edge Function handles activity logging, MP cancellation, FK cleanup, and user deletion.
 */
export const deleteSchool = async (companyId: string): Promise<void> => {
  const { data, error } = await supabase.functions.invoke('admin-delete-school', {
    body: { companyId },
  });

  if (error) {
    // supabase-js wraps non-2xx responses in FunctionsHttpError with a generic message.
    // The actual error body is in error.context (the Response object).
    let detail = error.message;
    try {
      const ctx = (error as unknown as { context: Response }).context;
      if (ctx?.json) {
        const body = await ctx.json();
        detail = body?.error ?? detail;
      }
    } catch {
      // If context parsing fails, fall back to data
      if (typeof data === 'object' && data?.error) detail = data.error;
    }
    console.error('[admin-delete-school]', detail);
    throw new Error(detail);
  }
};
