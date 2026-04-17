/**
 * Edge Function: admin-delete-school
 * Allows a platform admin to fully delete a school (company) and its owner.
 *
 * Flow:
 * 1. Validate JWT and load the authenticated caller
 * 2. Verify the caller has role = 'admin' in app_metadata
 * 3. Find the target company by companyId and resolve its owner (user_id)
 * 4. Clean up FK references pointing to the owner user
 * 5. Delete the auth user — DB cascades remove company and all child records
 */

import { getCorsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { createRequestLogger } from '../_shared/logger.ts';

async function cleanupUserReferences(
  userId: string,
  log: ReturnType<typeof createRequestLogger>
): Promise<void> {
  const { error: reviewedPaymentsError } = await supabaseAdmin
    .from('manual_payments')
    .update({ reviewed_by: null })
    .eq('reviewed_by', userId);

  if (reviewedPaymentsError) {
    log.error('Failed to detach manual_payments.reviewed_by', {
      error: reviewedPaymentsError.message,
    });
  }

  const { error: activityLogsError } = await supabaseAdmin
    .from('activity_logs')
    .update({ admin_id: null })
    .eq('admin_id', userId);

  if (activityLogsError) {
    log.error('Failed to detach activity_logs.admin_id', {
      error: activityLogsError.message,
    });

    if (
      activityLogsError.message.includes('null value in column') ||
      activityLogsError.message.includes('not-null constraint')
    ) {
      const { error: deleteActivityLogsError } = await supabaseAdmin
        .from('activity_logs')
        .delete()
        .eq('admin_id', userId);

      if (deleteActivityLogsError) {
        log.error('Failed to delete fallback activity_logs rows', {
          error: deleteActivityLogsError.message,
        });
      }
    }
  }
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'));
  const log = createRequestLogger('admin-delete-school', req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    // 1. Validate JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user: caller },
      error: callerError,
    } = await supabaseAdmin.auth.getUser(token);

    if (callerError || !caller) {
      log.error('JWT validation failed', { error: callerError?.message });
      return new Response(JSON.stringify({ error: callerError?.message || 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // 2. Verify the caller is an admin via app_metadata.role
    if (caller.app_metadata?.role !== 'admin') {
      log.warn('Non-admin caller attempted admin-delete-school', { callerId: caller.id });
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // 3. Parse request body and find the target company
    const { companyId } = await req.json();
    if (!companyId) {
      return new Response(JSON.stringify({ error: 'companyId is required' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, user_id')
      .eq('id', companyId)
      .maybeSingle();

    if (companyError) {
      log.error('Failed to fetch company', { companyId, error: companyError.message });
      return new Response(JSON.stringify({ error: 'Error al buscar la escuela' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (!company) {
      log.warn('Company not found', { companyId });
      return new Response(JSON.stringify({ error: 'Escuela no encontrada' }), {
        status: 404,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const targetUserId = company.user_id;
    log.info('Starting school deletion', { companyId, targetUserId, adminId: caller.id });

    // 4. Log the admin action before cleanup (while data still exists)
    const { error: logError } = await supabaseAdmin.from('activity_logs').insert({
      admin_id: caller.id,
      action: 'admin_delete_school',
      target_type: 'company',
      target_id: companyId,
      metadata: {
        target_user_id: targetUserId,
        deleted_by: caller.id,
      },
    });
    if (logError) {
      log.error('Failed to log activity', { error: logError.message });
    }

    // 5. Clean up FK references pointing to the school owner
    await cleanupUserReferences(targetUserId, log);

    // 6. Delete the auth user — DB cascades handle company and all child tables
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    if (deleteError) {
      log.error('Failed to delete auth user', { targetUserId, error: deleteError.message });
      return new Response(
        JSON.stringify({ error: deleteError.message || 'Error al eliminar la escuela' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    log.info('School deleted successfully', { companyId, targetUserId, adminId: caller.id });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    log.error('Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response(JSON.stringify({ error: 'Error al procesar la solicitud' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
