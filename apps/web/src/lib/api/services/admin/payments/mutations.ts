import { supabase } from '../../../../supabase/client';
import { handleSupabaseError } from '../../../../utils/errors';

/**
 * Approve a bank transfer payment.
 * Delegates to the admin_approve_payment RPC which atomically:
 * - marks the payment approved
 * - activates the company's subscription (idempotent: update approval_pending or insert)
 * - updates company status
 * - logs the action
 * - sends a notification
 */
export const approvePayment = async (paymentId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase.rpc('admin_approve_payment', {
    p_payment_id: paymentId,
    p_admin_id: user.id,
    p_admin_email: user.email ?? '',
  });

  if (error) handleSupabaseError(error);
};

/**
 * Reject a bank transfer payment.
 * Delegates to the admin_reject_payment RPC which atomically:
 * - marks the payment rejected with reason
 * - logs the action
 * - sends a notification
 */
export const rejectPayment = async (paymentId: string, reason: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase.rpc('admin_reject_payment', {
    p_payment_id: paymentId,
    p_admin_id: user.id,
    p_admin_email: user.email ?? '',
    p_reason: reason || undefined,
  });

  if (error) handleSupabaseError(error);
};
