/**
 * Edge Function: cron-check-subscriptions
 * Daily CRON job to manage subscription states.
 *
 * - Revokes access for cancelled subscriptions past their grace period
 * - Suspends bank-transfer subscriptions whose renewal period is overdue
 */

import { createLogger } from '../_shared/logger.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { getSupabaseSecretKey } from '../_shared/supabase-keys.ts';

const log = createLogger('cron-check-subscriptions');

function isAuthorizedCronRequest(req: Request): boolean {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const validTokens = [
    Deno.env.get('CRON_SECRET'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    Deno.env.get('SB_SECRET_KEY') ? getSupabaseSecretKey() : null,
  ].filter((value): value is string => Boolean(value));

  return Boolean(token && validTokens.includes(token));
}

Deno.serve(async (req) => {
  const startTime = performance.now();

  try {
    if (!isAuthorizedCronRequest(req)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date().toISOString();
    let revoked = 0;
    let suspendedOverdue = 0;

    // Revoke access for cancelled subscriptions past their grace period
    const { data: cancelledSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('company_id, current_period_end')
      .eq('status', 'cancelled')
      .not('current_period_end', 'is', null)
      .lt('current_period_end', now);

    if (cancelledSubs) {
      for (const sub of cancelledSubs) {
        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('is_subscribed')
          .eq('id', sub.company_id)
          .single();

        if (company?.is_subscribed) {
          await supabaseAdmin
            .from('companies')
            .update({ is_subscribed: false })
            .eq('id', sub.company_id);
          revoked++;
        }
      }
    }

    // Suspend active bank-transfer subscriptions once their paid period is overdue.
    // A later admin approval can reactivate/extend the subscription through admin_approve_payment.
    const { data: overdueBankTransferSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('id, company_id, current_period_end')
      .eq('payment_provider', 'bank_transfer')
      .eq('status', 'active')
      .not('current_period_end', 'is', null)
      .lt('current_period_end', now);

    if (overdueBankTransferSubs) {
      for (const sub of overdueBankTransferSubs) {
        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'suspended', suspended_at: now, updated_at: now })
          .eq('id', sub.id)
          .eq('status', 'active');

        if (subscriptionError) {
          log.error('Failed to suspend overdue bank-transfer subscription', {
            subscriptionId: sub.id,
            companyId: sub.company_id,
            error: subscriptionError.message,
          });
          continue;
        }

        const { error: companyError } = await supabaseAdmin
          .from('companies')
          .update({
            is_subscribed: false,
            subscription_status: 'suspended',
            bank_transfer_status: 'suspended',
            updated_at: now,
          })
          .eq('id', sub.company_id);

        if (companyError) {
          log.error('Failed to suspend overdue bank-transfer company', {
            subscriptionId: sub.id,
            companyId: sub.company_id,
            error: companyError.message,
          });
          continue;
        }

        suspendedOverdue++;
      }
    }

    const durationMs = Math.round(performance.now() - startTime);

    log.info('CRON complete', { revoked, suspendedOverdue, durationMs });

    return new Response(JSON.stringify({ success: true, revoked, suspendedOverdue }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    log.error('cron-check-subscriptions error', {
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
