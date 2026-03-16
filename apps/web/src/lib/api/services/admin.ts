import { supabase } from '../../supabase/client';
import { handleSupabaseError } from '../../utils/errors';
import { formatPlanName } from '../../../constants/plans';
import {
  mapCertificateFromDb,
  mapSystemFromDb,
  mapQRDocumentFromDb,
  mapEventFromDb,
} from '../mappers';
import type {
  FireExtinguisherControl,
  ConservationCertificate,
  SelfProtectionSystem,
  QRDocument,
  EventInformation,
} from '../../../types';
import type {
  AdminStats,
  AdminSchoolRow,
  AdminPaymentRow,
  AdminSaleRow,
  AdminSchoolDetail,
  AdminDocumentModule,
  ActivityLogRow,
  MonthlyMetric,
  MetricsSummary,
  SubscriptionPlanRow,
} from '../../../features/admin/types';

// Cast for tables not yet in generated database.types.ts
// After running `supabase db push && supabase gen types`, these can be removed
const db = supabase as any;

/**
 * Fetch aggregate stats for the admin dashboard.
 * All queries go through RLS which requires admin role.
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  // Active schools (subscribed)
  const { count: activeCount, error: e1 } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .eq('is_subscribed', true);
  if (e1) handleSupabaseError(e1);

  // Pending bank transfer payments
  const { count: pendingCount, error: e2 } = await db
    .from('manual_payments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
  if (e2) handleSupabaseError(e2);

  // Rejected bank transfer payments (this month)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: rejectedCount, error: e3 } = await db
    .from('manual_payments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'rejected')
    .gte('created_at', startOfMonth.toISOString());
  if (e3) handleSupabaseError(e3);

  // Monthly revenue from approved manual payments
  const { data: approvedPayments, error: e4 } = await db
    .from('manual_payments')
    .select('amount')
    .eq('status', 'approved')
    .gte('reviewed_at', startOfMonth.toISOString());
  if (e4) handleSupabaseError(e4);

  // Also try payment_transactions (MercadoPago)
  const { data: transactions } = await db
    .from('payment_transactions')
    .select('gross_amount')
    .eq('status', 'approved')
    .gte('created_at', startOfMonth.toISOString());

  const txRevenue = (transactions || []).reduce(
    (sum: number, t: { gross_amount: number }) => sum + (t.gross_amount || 0),
    0
  );

  const manualRevenue = (approvedPayments || []).reduce(
    (sum: number, p: { amount: number }) => sum + (p.amount || 0),
    0
  );

  return {
    activeSchools: activeCount ?? 0,
    pendingPayments: pendingCount ?? 0,
    rejectedPayments: rejectedCount ?? 0,
    monthlyRevenue: manualRevenue + txRevenue,
  };
};

/**
 * Fetch recent school registrations (last N).
 */
export const getRecentRegistrations = async (
  limit = 10
): Promise<AdminSchoolRow[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, city, province, selected_plan, subscription_status, created_at, employees(email, role)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) handleSupabaseError(error);

  return (data || []).map((row: any) => {
    const ownerEmail =
      (row.employees || []).find((e: any) => e.role === 'Administrador')?.email ||
      (row.employees || [])[0]?.email ||
      '';
    return {
      id: row.id,
      name: row.name,
      email: ownerEmail,
      city: row.city,
      province: row.province,
      plan: formatPlanName(row.selected_plan),
      subscriptionStatus: row.subscription_status || 'Sin suscripción',
      paymentMethod: 'mercadopago',
      createdAt: row.created_at,
    };
  });
};

/**
 * Fetch pending bank transfer payments.
 */
export const getPendingPayments = async (): Promise<AdminPaymentRow[]> => {
  const { data, error } = await db
    .from('manual_payments')
    .select('id, company_id, amount, period_start, period_end, status, created_at, rejection_reason, receipt_url')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) handleSupabaseError(error);
  if (!data || data.length === 0) return [];

  // Fetch company names for all pending payments
  const companyIds: string[] = Array.from(new Set<string>(data.map((r: any) => String(r.company_id))));
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .in('id', companyIds);

  const companyMap = new Map((companies || []).map((c: any) => [c.id, c.name]));

  return data.map((row: any) => ({
    id: row.id,
    companyId: row.company_id,
    companyName: companyMap.get(row.company_id) || 'Desconocido',
    amount: row.amount,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    status: row.status,
    createdAt: row.created_at,
    rejectionReason: row.rejection_reason,
    receiptUrl: row.receipt_url || null,
  }));
};

/**
 * Fetch ALL bank transfer payments (all statuses).
 */
export const getAllPayments = async (): Promise<AdminPaymentRow[]> => {
  const { data, error } = await db
    .from('manual_payments')
    .select(
      'id, company_id, amount, period_start, period_end, status, created_at, rejection_reason, receipt_url'
    )
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error);
  if (!data || data.length === 0) return [];

  // Fetch company names for all payments
  const companyIds: string[] = Array.from(
    new Set<string>(data.map((r: any) => String(r.company_id)))
  );
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .in('id', companyIds);

  const companyMap = new Map((companies || []).map((c: any) => [c.id, c.name]));

  return data.map((row: any) => ({
    id: row.id,
    companyId: row.company_id,
    companyName: companyMap.get(row.company_id) || 'Desconocido',
    amount: row.amount,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    status: row.status,
    createdAt: row.created_at,
    rejectionReason: row.rejection_reason,
    receiptUrl: row.receipt_url || null,
  }));
};

/**
 * Get a signed URL for a payment receipt from Supabase Storage.
 */
export const getReceiptSignedUrl = async (path: string): Promise<string> => {
  // Strip bucket prefix if the path includes it
  const cleanPath = path.startsWith('receipts/') ? path.replace('receipts/', '') : path;

  const { data, error } = await supabase.storage.from('receipts').createSignedUrl(cleanPath, 300); // 5 min

  if (error) handleSupabaseError(error);
  return data!.signedUrl;
};

/**
 * Approve a bank transfer payment.
 */
export const approvePayment = async (paymentId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await db
    .from('manual_payments')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', paymentId);

  if (error) handleSupabaseError(error);

  // Fetch the payment to get company_id for activation and audit metadata
  const { data: payment } = await db
    .from('manual_payments')
    .select('company_id')
    .eq('id', paymentId)
    .single();

  // Log the action (include company_id for audit trail)
  const { error: logError } = await db.from('activity_logs').insert({
    admin_id: user.id,
    action: 'approve_payment',
    target_type: 'manual_payment',
    target_id: paymentId,
    metadata: { company_id: payment?.company_id ?? null },
  });
  if (logError) console.error('Failed to log approve_payment:', logError);

  if (payment) {
    await supabase
      .from('companies')
      .update({
        is_subscribed: true,
        subscription_status: 'active',
        bank_transfer_status: 'active',
      } as any)
      .eq('id', payment.company_id);

    // Notify the company that their payment was approved
    await db.from('notifications').insert({
      company_id: payment.company_id,
      type: 'system',
      category: 'system',
      title: 'Pago aprobado',
      message: 'Tu transferencia bancaria fue aprobada. Tu suscripcion esta activa.',
      link: '/bank-transfer/status',
      related_table: 'manual_payments',
      related_id: paymentId,
      is_read: false,
    });
  }
};

/**
 * Reject a bank transfer payment.
 */
export const rejectPayment = async (
  paymentId: string,
  reason: string
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await db
    .from('manual_payments')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', paymentId);

  if (error) handleSupabaseError(error);

  // Log the action
  const { error: logError } = await db.from('activity_logs').insert({
    admin_id: user.id,
    action: 'reject_payment',
    target_type: 'manual_payment',
    target_id: paymentId,
    metadata: { reason },
  });
  if (logError) console.error('Failed to log reject_payment:', logError);

  // Notify the company that their payment was rejected
  const { data: payment } = await db
    .from('manual_payments')
    .select('company_id')
    .eq('id', paymentId)
    .single();

  if (payment) {
    await db.from('notifications').insert({
      company_id: payment.company_id,
      type: 'info',
      category: 'system',
      title: 'Pago rechazado',
      message: reason
        ? `Tu transferencia fue rechazada: ${reason}`
        : 'Tu transferencia bancaria fue rechazada. Por favor subi un nuevo comprobante.',
      link: '/bank-transfer/status',
      related_table: 'manual_payments',
      related_id: paymentId,
      is_read: false,
    });
  }
};

/**
 * Fetch recent sales/transactions (approved payments + MercadoPago transactions).
 */
export const getRecentSales = async (limit = 10): Promise<AdminSaleRow[]> => {
  // Approved manual payments
  const { data: manualData, error: e1 } = await db
    .from('manual_payments')
    .select('id, amount, reviewed_at, company_id')
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false })
    .limit(limit);

  if (e1) handleSupabaseError(e1);

  // Fetch company info for manual payments
  const companyIds: string[] = Array.from(new Set<string>((manualData || []).map((r: any) => String(r.company_id))));
  let companyMap = new Map<string, { name: string; plan: string }>();
  if (companyIds.length > 0) {
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, selected_plan')
      .in('id', companyIds);
    companyMap = new Map(
      (companies || []).map((c: any) => [c.id, { name: c.name, plan: formatPlanName(c.selected_plan) }])
    );
  }

  const sales: AdminSaleRow[] = (manualData || []).map((row: any) => {
    const company = companyMap.get(row.company_id);
    return {
      id: row.id,
      companyName: company?.name || 'Desconocido',
      plan: company?.plan || 'Sin plan',
      amount: row.amount,
      status: 'Transferencia',
      date: row.reviewed_at || '',
    };
  });

  // Also fetch from payment_transactions if table exists
  const { data: txData } = await db
    .from('payment_transactions')
    .select('id, gross_amount, created_at, status')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (txData) {
    for (const tx of txData) {
      sales.push({
        id: tx.id,
        companyName: '-',
        plan: '-',
        amount: tx.gross_amount || 0,
        status: 'MercadoPago',
        date: tx.created_at,
      });
    }
  }

  // Sort by date descending and take limit
  sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sales.slice(0, limit);
};

/**
 * Fetch a single school's full details.
 */
export const getSchoolDetail = async (companyId: string): Promise<AdminSchoolDetail> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*, employees(*)')
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
      ((data as any).employees || []).find((e: any) => e.role === 'Administrador')?.email ||
      ((data as any).employees || [])[0]?.email ||
      '',
    plan: formatPlanName(data.selected_plan),
    subscriptionStatus: data.subscription_status || 'Sin suscripción',
    paymentMethod: (data as any).payment_method || 'mercadopago',
    bankTransferStatus: (data as any).bank_transfer_status || null,
    isSubscribed: data.is_subscribed || false,
    trialEndsAt: data.trial_ends_at || null,
    subscriptionRenewalDate: data.subscription_renewal_date || null,
    createdAt: data.created_at ?? '',
    employees: ((data as any).employees || []).map((e: any) => ({
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
export const getSchoolDocumentCounts = async (companyId: string): Promise<Record<string, number>> => {
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
 * Fetch payment history for a school (manual payments + MercadoPago transactions).
 */
export const getSchoolPaymentHistory = async (companyId: string): Promise<AdminPaymentRow[]> => {
  // Fetch manual (bank transfer) payments
  const { data: manualData } = await db
    .from('manual_payments')
    .select('id, company_id, amount, period_start, period_end, status, created_at, rejection_reason, receipt_url')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  const manualRows: AdminPaymentRow[] = (manualData || []).map((row: any) => ({
    id: row.id,
    companyId: row.company_id,
    companyName: '',
    amount: row.amount,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    status: row.status,
    createdAt: row.created_at,
    rejectionReason: row.rejection_reason,
    receiptUrl: row.receipt_url || null,
  }));

  // Fetch MercadoPago transactions
  const { data: txData } = await db
    .from('payment_transactions')
    .select('id, company_id, gross_amount, status, created_at, paid_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  const txRows: AdminPaymentRow[] = (txData || []).map((row: any) => ({
    id: row.id,
    companyId: row.company_id,
    companyName: '',
    amount: row.gross_amount || 0,
    periodStart: row.paid_at || row.created_at,
    periodEnd: '',
    status: row.status === 'approved' ? 'approved' : row.status === 'pending' ? 'pending' : 'rejected',
    createdAt: row.created_at,
    rejectionReason: null,
    receiptUrl: null,
  }));

  // Merge and sort by date descending
  return [...manualRows, ...txRows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Fetch activity logs for the admin panel.
 */
export const getActivityLogs = async (): Promise<ActivityLogRow[]> => {
  const { data, error } = await db
    .from('activity_logs')
    .select('id, admin_id, action, target_type, target_id, metadata, created_at')
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error);
  if (!data || data.length === 0) return [];

  // Fetch admin info from employees table
  const adminIds: string[] = Array.from(new Set<string>(data.map((r: any) => String(r.admin_id))));
  const { data: employees } = await supabase
    .from('employees')
    .select('user_id, email, name')
    .in('user_id', adminIds);

  const adminMap = new Map<string, string>(
    (employees || []).map((e: any) => [e.user_id, e.email || e.name || 'Admin'])
  );

  return data.map((row: any) => ({
    id: row.id,
    adminId: row.admin_id,
    adminEmail: adminMap.get(row.admin_id) || 'Admin',
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  }));
};

/**
 * Fetch all schools for the admin list.
 */
export const getAllSchools = async (): Promise<AdminSchoolRow[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, city, province, selected_plan, subscription_status, created_at, employees(email, role)')
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error);

  return (data || []).map((row: any) => {
    const ownerEmail =
      (row.employees || []).find((e: any) => e.role === 'Administrador')?.email ||
      (row.employees || [])[0]?.email ||
      '';
    return {
      id: row.id,
      name: row.name,
      email: ownerEmail,
      city: row.city,
      province: row.province,
      plan: formatPlanName(row.selected_plan),
      subscriptionStatus: row.subscription_status || 'Sin suscripcion',
      paymentMethod: 'mercadopago',
      createdAt: row.created_at,
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
    .update({ subscription_status: 'suspended', is_subscribed: false } as any)
    .eq('id', companyId);

  if (error) handleSupabaseError(error);

  const { error: logError } = await db.from('activity_logs').insert({
    admin_id: user.id,
    action: 'suspend_school',
    target_type: 'company',
    target_id: companyId,
  });
  if (logError) console.error('Failed to log suspend_school:', logError);
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
    .update({ subscription_status: 'active', is_subscribed: true } as any)
    .eq('id', companyId);

  if (error) handleSupabaseError(error);

  const { error: logError } = await db.from('activity_logs').insert({
    admin_id: user.id,
    action: 'activate_school',
    target_type: 'company',
    target_id: companyId,
  });
  if (logError) console.error('Failed to log activate_school:', logError);
};

/**
 * Delete a school.
 */
export const deleteSchool = async (companyId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  // Log before delete (cascade will remove the company)
  const { error: logError } = await db.from('activity_logs').insert({
    admin_id: user.id,
    action: 'delete_school',
    target_type: 'company',
    target_id: companyId,
  });
  if (logError) console.error('Failed to log delete_school:', logError);

  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId);

  if (error) handleSupabaseError(error);
};

/**
 * Fetch all subscription plans.
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlanRow[]> => {
  const { data, error } = await db
    .from('subscription_plans')
    .select('id, key, name, price, features, is_active, sort_order, description, tag, highlighted, created_at')
    .order('sort_order', { ascending: true });

  if (error) handleSupabaseError(error);

  return (data || []).map((row: any) => ({
    id: row.id,
    key: row.key,
    name: row.name,
    price: row.price,
    features: row.features || [],
    isActive: row.is_active,
    sortOrder: row.sort_order,
    description: row.description || '',
    tag: row.tag,
    highlighted: row.highlighted ?? false,
    createdAt: row.created_at,
  }));
};

/**
 * Create a subscription plan.
 */
export const createSubscriptionPlan = async (plan: {
  key: string;
  name: string;
  price: number;
  features: string[];
  sortOrder: number;
  description: string;
  tag: string | null;
  highlighted: boolean;
}): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await db
    .from('subscription_plans')
    .insert({
      key: plan.key,
      name: plan.name,
      price: plan.price,
      features: plan.features,
      sort_order: plan.sortOrder,
      description: plan.description,
      tag: plan.tag,
      highlighted: plan.highlighted,
    })
    .select('id')
    .single();

  if (error) handleSupabaseError(error);

  // Log action
  await db.from('activity_logs').insert({
    admin_id: user.id,
    action: 'create_plan',
    target_type: 'subscription_plan',
    target_id: data.id,
    metadata: { name: plan.name, price: plan.price },
  });
};

/**
 * Update a subscription plan.
 */
export const updateSubscriptionPlan = async (
  planId: string,
  plan: {
    name: string;
    price: number;
    features: string[];
    sortOrder: number;
    description: string;
    tag: string | null;
    highlighted: boolean;
  }
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await db
    .from('subscription_plans')
    .update({
      name: plan.name,
      price: plan.price,
      features: plan.features,
      sort_order: plan.sortOrder,
      description: plan.description,
      tag: plan.tag,
      highlighted: plan.highlighted,
    })
    .eq('id', planId);

  if (error) handleSupabaseError(error);

  await db.from('activity_logs').insert({
    admin_id: user.id,
    action: 'update_plan',
    target_type: 'subscription_plan',
    target_id: planId,
    metadata: { name: plan.name, price: plan.price },
  });
};

/**
 * Toggle a subscription plan's active status.
 */
export const toggleSubscriptionPlan = async (planId: string, isActive: boolean): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await db
    .from('subscription_plans')
    .update({ is_active: isActive })
    .eq('id', planId);

  if (error) handleSupabaseError(error);

  await db.from('activity_logs').insert({
    admin_id: user.id,
    action: 'toggle_plan',
    target_type: 'subscription_plan',
    target_id: planId,
    metadata: { is_active: isActive },
  });
};

/**
 * Delete a subscription plan.
 */
export const deleteSubscriptionPlan = async (planId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  // Log before delete
  await db.from('activity_logs').insert({
    admin_id: user.id,
    action: 'delete_plan',
    target_type: 'subscription_plan',
    target_id: planId,
  });

  const { error } = await db
    .from('subscription_plans')
    .delete()
    .eq('id', planId);

  if (error) handleSupabaseError(error);
};

/**
 * Fetch metrics summary for the admin metrics page.
 */
export const getMetricsSummary = async (): Promise<MetricsSummary> => {
  // Active schools
  const { count: activeCount, error: e1 } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .eq('is_subscribed', true);
  if (e1) handleSupabaseError(e1);

  // New registrations this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: newCount, error: e2 } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());
  if (e2) handleSupabaseError(e2);

  // Total companies for retention calculation
  const { count: totalCount, error: e3 } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true });
  if (e3) handleSupabaseError(e3);

  const total = totalCount ?? 0;
  const active = activeCount ?? 0;
  const retentionRate = total > 0 ? Math.round((active / total) * 100) : 0;

  // Monthly revenue (same logic as getAdminStats)
  const { data: approvedPayments, error: e4 } = await db
    .from('manual_payments')
    .select('amount')
    .eq('status', 'approved')
    .gte('reviewed_at', startOfMonth.toISOString());
  if (e4) handleSupabaseError(e4);

  const { data: transactions } = await db
    .from('payment_transactions')
    .select('gross_amount')
    .eq('status', 'approved')
    .gte('created_at', startOfMonth.toISOString());

  const manualRevenue = (approvedPayments || []).reduce(
    (sum: number, p: { amount: number }) => sum + (p.amount || 0),
    0
  );
  const txRevenue = (transactions || []).reduce(
    (sum: number, t: { gross_amount: number }) => sum + (t.gross_amount || 0),
    0
  );

  return {
    totalActive: active,
    newRegistrations: newCount ?? 0,
    retentionRate,
    monthlyRevenue: manualRevenue + txRevenue,
  };
};

/**
 * Fetch monthly metrics for charts (last 6 months).
 * All months are fetched in parallel to avoid slow sequential loading.
 */
export const getMonthlyMetrics = async (): Promise<MonthlyMetric[]> => {
  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];

  const now = new Date();

  const fetchMonth = async (i: number): Promise<MonthlyMetric> => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.toISOString();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
    const label = monthNames[d.getMonth()];

    const [regResult, activeResult, cancelledResult, paymentsResult, txsResult] =
      await Promise.all([
        supabase
          .from('companies')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', start)
          .lt('created_at', end),
        supabase
          .from('companies')
          .select('id', { count: 'exact', head: true })
          .eq('is_subscribed', true)
          .lt('created_at', end),
        supabase
          .from('companies')
          .select('id', { count: 'exact', head: true })
          .in('subscription_status', ['cancelled', 'suspended'])
          .lt('created_at', end),
        db
          .from('manual_payments')
          .select('amount')
          .eq('status', 'approved')
          .gte('reviewed_at', start)
          .lt('reviewed_at', end),
        db
          .from('payment_transactions')
          .select('gross_amount')
          .eq('status', 'approved')
          .gte('created_at', start)
          .lt('created_at', end),
      ]);

    const revenue =
      (paymentsResult.data || []).reduce(
        (s: number, p: { amount: number }) => s + (p.amount || 0),
        0,
      ) +
      (txsResult.data || []).reduce(
        (s: number, t: { gross_amount: number }) => s + (t.gross_amount || 0),
        0,
      );

    return {
      month: label,
      registrations: regResult.count ?? 0,
      active: activeResult.count ?? 0,
      cancelled: cancelledResult.count ?? 0,
      revenue,
    };
  };

  const results = await Promise.all(
    [5, 4, 3, 2, 1, 0].map((i) => fetchMonth(i)),
  );

  return results;
};

// ═══════════════════════════════════════════════════════════
// Admin Document Access Functions
// ═══════════════════════════════════════════════════════════

/**
 * Inline mapper for fire extinguishers (same as in fireExtinguisher.ts).
 */
const mapFireExtinguisher = (item: any): FireExtinguisherControl => ({
  id: item.id,
  companyId: item.company_id,
  controlDate: item.control_date,
  extinguisherNumber: item.extinguisher_number,
  type: item.type,
  capacity: item.capacity,
  class: item.class,
  positionNumber: item.position_number,
  chargeExpirationDate: item.charge_expiration_date,
  hydraulicPressureExpirationDate: item.hydraulic_pressure_expiration_date,
  manufacturingYear: item.manufacturing_year,
  tagColor: item.tag_color,
  labelsLegible: item.labels_legible,
  pressureWithinRange: item.pressure_within_range,
  hasSealAndSafety: item.has_seal_and_safety,
  instructionsLegible: item.instructions_legible,
  containerCondition: item.container_condition,
  nozzleCondition: item.nozzle_condition,
  visibilityObstructed: item.visibility_obstructed,
  accessObstructed: item.access_obstructed,
  signageCondition: item.signage_condition,
  signageFloor: item.signage_floor,
  signageWall: item.signage_wall,
  signageHeight: item.signage_height,
  glassCondition: item.glass_condition,
  doorOpensEasily: item.door_opens_easily,
  cabinetClean: item.cabinet_clean,
  observations: item.observations,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

// ─── List documents ─────────────────────────────────────

export const getSchoolFireExtinguishers = async (
  companyId: string
): Promise<FireExtinguisherControl[]> => {
  const { data, error } = await supabase
    .from('fire_extinguishers')
    .select('*')
    .eq('company_id', companyId)
    .order('control_date', { ascending: false });
  if (error) handleSupabaseError(error);
  return (data || []).map(mapFireExtinguisher);
};

export const getSchoolCertificates = async (
  companyId: string
): Promise<(ConservationCertificate & { pdfFilePath?: string })[]> => {
  const { data, error } = await supabase
    .from('conservation_certificates')
    .select('*')
    .eq('company_id', companyId)
    .order('expiration_date', { ascending: false });
  if (error) handleSupabaseError(error);
  return (data || []).map((row) => ({
    ...mapCertificateFromDb(row),
    pdfFilePath: row.pdf_file_path || undefined,
  }));
};

export const getSchoolSystems = async (
  companyId: string
): Promise<(SelfProtectionSystem & { probatoryDispositionPdfPath?: string })[]> => {
  const { data, error } = await supabase
    .from('self_protection_systems')
    .select('*')
    .eq('company_id', companyId)
    .order('expiration_date', { ascending: false });
  if (error) handleSupabaseError(error);
  return (data || []).map((row) => ({
    ...mapSystemFromDb(row),
    probatoryDispositionPdfPath: (row as any).probatory_disposition_pdf_path || undefined,
  }));
};

export const getSchoolQRDocuments = async (
  companyId: string,
  type?: string
): Promise<(QRDocument & { pdfFilePath?: string })[]> => {
  let query = supabase
    .from('qr_documents')
    .select('*')
    .eq('company_id', companyId)
    .order('upload_date', { ascending: false });
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) handleSupabaseError(error);
  return (data || []).map((row) => ({
    ...mapQRDocumentFromDb(row),
    pdfFilePath: row.pdf_file_path || undefined,
  }));
};

export const getSchoolEvents = async (
  companyId: string
): Promise<EventInformation[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('company_id', companyId)
    .order('date', { ascending: false });
  if (error) handleSupabaseError(error);
  return (data || []).map(mapEventFromDb);
};

// ─── Delete documents ───────────────────────────────────

const logAdminAction = async (
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await db.from('activity_logs').insert({
    admin_id: user.id,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata: metadata || {},
  });
};

export const adminDeleteFireExtinguisher = async (id: string): Promise<void> => {
  const { error } = await supabase.from('fire_extinguishers').delete().eq('id', id);
  if (error) handleSupabaseError(error);
  await logAdminAction('delete_document', 'fire_extinguisher', id);
};

export const adminDeleteCertificate = async (id: string): Promise<void> => {
  const { data } = await supabase
    .from('conservation_certificates')
    .select('pdf_file_path')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('conservation_certificates').delete().eq('id', id);
  if (error) handleSupabaseError(error);

  if (data?.pdf_file_path) {
    await supabase.storage.from('certificates').remove([data.pdf_file_path]);
  }
  await logAdminAction('delete_document', 'conservation_certificate', id);
};

export const adminDeleteSystem = async (id: string): Promise<void> => {
  const { data } = await supabase
    .from('self_protection_systems')
    .select('probatory_disposition_pdf_path, extension_pdf_path, drills')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('self_protection_systems').delete().eq('id', id);
  if (error) handleSupabaseError(error);

  if (data) {
    const filesToRemove: string[] = [];
    if ((data as any).probatory_disposition_pdf_path)
      filesToRemove.push((data as any).probatory_disposition_pdf_path);
    if ((data as any).extension_pdf_path)
      filesToRemove.push((data as any).extension_pdf_path);
    const drills = Array.isArray(data.drills) ? data.drills : [];
    for (const drill of drills) {
      if ((drill as any).pdfPath) filesToRemove.push((drill as any).pdfPath);
    }
    if (filesToRemove.length > 0) {
      await supabase.storage.from('self-protection-systems').remove(filesToRemove);
    }
  }
  await logAdminAction('delete_document', 'self_protection_system', id);
};

export const adminDeleteQRDocument = async (id: string): Promise<void> => {
  const { data } = await supabase
    .from('qr_documents')
    .select('pdf_file_path')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('qr_documents').delete().eq('id', id);
  if (error) handleSupabaseError(error);

  if (data?.pdf_file_path) {
    await supabase.storage.from('qr-documents').remove([data.pdf_file_path]);
  }
  await logAdminAction('delete_document', 'qr_document', id);
};

export const adminDeleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) handleSupabaseError(error);
  await logAdminAction('delete_document', 'event', id);
};

// ─── Signed URLs for PDF viewing ────────────────────────

export const getAdminSignedUrl = async (
  bucket: string,
  path: string
): Promise<string> => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) handleSupabaseError(error);
  return data!.signedUrl;
};

// ─── Document fetcher by module key ─────────────────────

export const getSchoolDocuments = async (
  companyId: string,
  module: AdminDocumentModule
): Promise<unknown[]> => {
  switch (module) {
    case 'fire_extinguishers':
      return getSchoolFireExtinguishers(companyId);
    case 'conservation_certificates':
      return getSchoolCertificates(companyId);
    case 'self_protection_systems':
      return getSchoolSystems(companyId);
    case 'qr_documents':
      return getSchoolQRDocuments(companyId);
    case 'events':
      return getSchoolEvents(companyId);
  }
};

export const adminDeleteDocument = async (
  module: AdminDocumentModule,
  id: string
): Promise<void> => {
  switch (module) {
    case 'fire_extinguishers':
      return adminDeleteFireExtinguisher(id);
    case 'conservation_certificates':
      return adminDeleteCertificate(id);
    case 'self_protection_systems':
      return adminDeleteSystem(id);
    case 'qr_documents':
      return adminDeleteQRDocument(id);
    case 'events':
      return adminDeleteEvent(id);
  }
};
