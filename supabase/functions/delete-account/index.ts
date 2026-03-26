/**
 * Edge Function: delete-account
 * Deletes the authenticated user's account.
 *
 * Flow:
 * 1. Validate JWT and load the authenticated user
 * 2. Cancel active MercadoPago subscription (if any)
 * 3. Send farewell email
 * 4. Delete user via admin API (DB cascades handle the rest)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { getMpConfig, getMpHeaders } from '../_shared/mp-auth.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { sendEmailSafe } from '../_shared/resend.ts';

async function cleanupUserReferences(userId: string): Promise<void> {
  const { error: reviewedPaymentsError } = await supabaseAdmin
    .from('manual_payments')
    .update({ reviewed_by: null })
    .eq('reviewed_by', userId);

  if (reviewedPaymentsError) {
    console.error('[delete-account] Failed to detach manual_payments.reviewed_by:', reviewedPaymentsError.message);
  }

  const { error: activityLogsError } = await supabaseAdmin
    .from('activity_logs')
    .update({ admin_id: null })
    .eq('admin_id', userId);

  if (activityLogsError) {
    console.error('[delete-account] Failed to detach activity_logs.admin_id:', activityLogsError.message);

    if (
      activityLogsError.message.includes('null value in column') ||
      activityLogsError.message.includes('not-null constraint')
    ) {
      const { error: deleteActivityLogsError } = await supabaseAdmin
        .from('activity_logs')
        .delete()
        .eq('admin_id', userId);

      if (deleteActivityLogsError) {
        console.error('[delete-account] Failed to delete fallback activity_logs rows:', deleteActivityLogsError.message);
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
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('[delete-account] JWT validation failed:', userError?.message);
      return new Response(
        JSON.stringify({ error: userError?.message || 'Unauthorized' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    console.log(`[delete-account] Starting deletion for user ${user.id}`);

    // Find company and active MP subscription
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (company) {
      const { data: activeSub } = await supabaseAdmin
        .from('subscriptions')
        .select('mp_preapproval_id, status')
        .eq('company_id', company.id)
        .eq('payment_provider', 'mercadopago')
        .in('status', ['active', 'pending'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeSub?.mp_preapproval_id && ['active', 'pending'].includes(activeSub.status)) {
        console.log(`[delete-account] Cancelling MP subscription ${activeSub.mp_preapproval_id}`);
        try {
          const config = getMpConfig();
          const mpRes = await fetch(
            `${config.baseUrl}/preapproval/${activeSub.mp_preapproval_id}`,
            {
              method: 'PUT',
              headers: getMpHeaders(),
              body: JSON.stringify({ status: 'cancelled', reason: 'Account deleted by user' }),
            },
          );
          if (!mpRes.ok) {
            console.error(`[delete-account] MP cancel returned HTTP ${mpRes.status}`);
          } else {
            console.log(`[delete-account] MP subscription cancelled`);
          }
        } catch (mpErr) {
          console.error('[delete-account] Failed to cancel MP subscription:', mpErr);
        }
      }
    }

    // Send farewell email (non-blocking)
    if (user.email) {
      const userName = user.user_metadata?.name || user.email.split('@')[0] || 'Usuario';
      await sendEmailSafe({
        to: user.email,
        subject: 'Tu cuenta de Escuela Segura ha sido eliminada',
        html: `
          <p>Hola ${userName},</p>
          <p>Confirmamos que tu cuenta de <strong>Escuela Segura</strong> y todos tus datos asociados han sido eliminados permanentemente.</p>
          <p>Si esto fue un error o tenés alguna consulta, contactanos a soporte@escuelasegura.com.</p>
          <p>¡Hasta pronto!</p>
          <p><em>El equipo de Escuela Segura</em></p>
        `,
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
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    console.log(`[delete-account] User ${user.id} deleted successfully`);
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[delete-account] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar la solicitud' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  }
});
