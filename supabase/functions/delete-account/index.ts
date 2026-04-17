/**
 * Edge Function: delete-account
 * Deletes the authenticated user's account.
 *
 * Flow:
 * 1. Validate JWT and load the authenticated user
 * 2. Send farewell email
 * 3. Delete user via admin API (DB cascades handle the rest)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { getSupabasePublishableKey } from '../_shared/supabase-keys.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { sendEmailSafe } from '../_shared/resend.ts';
import { accountDeletedEmail } from '../_shared/email-templates.ts';

async function cleanupUserReferences(userId: string): Promise<void> {
  const { error: reviewedPaymentsError } = await supabaseAdmin
    .from('manual_payments')
    .update({ reviewed_by: null })
    .eq('reviewed_by', userId);

  if (reviewedPaymentsError) {
    console.error(
      '[delete-account] Failed to detach manual_payments.reviewed_by:',
      reviewedPaymentsError.message
    );
  }

  const { error: activityLogsError } = await supabaseAdmin
    .from('activity_logs')
    .update({ admin_id: null })
    .eq('admin_id', userId);

  if (activityLogsError) {
    console.error(
      '[delete-account] Failed to detach activity_logs.admin_id:',
      activityLogsError.message
    );

    if (
      activityLogsError.message.includes('null value in column') ||
      activityLogsError.message.includes('not-null constraint')
    ) {
      const { error: deleteActivityLogsError } = await supabaseAdmin
        .from('activity_logs')
        .delete()
        .eq('admin_id', userId);

      if (deleteActivityLogsError) {
        console.error(
          '[delete-account] Failed to delete fallback activity_logs rows:',
          deleteActivityLogsError.message
        );
      }
    }
  }
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, getSupabasePublishableKey(), {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('[delete-account] JWT validation failed:', userError?.message);
      return new Response(JSON.stringify({ error: userError?.message || 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[delete-account] Starting deletion for user ${user.id}`);

    // Send farewell email (non-blocking)
    if (user.email) {
      const userName = user.user_metadata?.name || user.email.split('@')[0] || 'Usuario';
      const supportEmail = Deno.env.get('SUPPORT_EMAIL') || 'soporte@escuelasegura.com';
      await sendEmailSafe({
        to: user.email,
        subject: 'Tu cuenta de Escuela Segura ha sido eliminada',
        html: accountDeletedEmail(userName, supportEmail),
        idempotencyKey: `account-deleted-${user.id}`,
        tags: [
          { name: 'event', value: 'account-deleted' },
          { name: 'source', value: 'delete-account' },
        ],
      });
    }

    // Log account deletion before cleanup (while user data still exists)
    const { error: logError } = await supabaseAdmin.from('activity_logs').insert({
      admin_id: null,
      action: 'delete_account',
      target_type: 'user',
      target_id: user.id,
      metadata: {
        user_email: user.email,
        user_name: user.user_metadata?.name || null,
      },
    });
    if (logError) {
      console.error('[delete-account] Failed to log activity:', logError.message);
    }

    await cleanupUserReferences(user.id);

    // Delete user — DB cascades handle companies and all child tables
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('[delete-account] Failed to delete user:', deleteError.message);
      return new Response(
        JSON.stringify({ error: deleteError.message || 'Error al eliminar la cuenta' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[delete-account] User ${user.id} deleted successfully`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[delete-account] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Error al procesar la solicitud' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
