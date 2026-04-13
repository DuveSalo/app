/**
 * Edge Function: cron-check-subscriptions
 * Daily CRON job to sync subscription states with MercadoPago.
 *
 * - Checks active subscriptions whose period may have ended
 * - Revokes access for cancelled subscriptions past their grace period
 * - Syncs stale subscription data with MercadoPago API
 * - Logs discrepancies when DB status differs from MercadoPago status
 */

import { getMpConfig, getMpHeaders, mpFetch } from '../_shared/mp-auth.ts';
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

async function syncMpSubscription(
  sub: { mp_preapproval_id: string; company_id: string },
  config: { baseUrl: string }
): Promise<{ synced: boolean; revoked: boolean; discrepancy: boolean }> {
  const headers = getMpHeaders();

  try {
    const preapproval = await mpFetch<Record<string, unknown>>(
      `${config.baseUrl}/preapproval/${sub.mp_preapproval_id}`,
      { method: 'GET', headers }
    );

    const mpStatus = preapproval.status as string;

    if (mpStatus === 'authorized') {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          next_billing_time: (preapproval.next_payment_date as string) || null,
        })
        .eq('mp_preapproval_id', sub.mp_preapproval_id);
      return { synced: true, revoked: false, discrepancy: false };
    }

    if (mpStatus === 'cancelled' || mpStatus === 'paused') {
      const statusMap: Record<string, string> = {
        cancelled: 'cancelled',
        paused: 'suspended',
      };

      log.warn('Subscription discrepancy detected', {
        companyId: sub.company_id,
        mpPreapprovalId: sub.mp_preapproval_id,
        dbStatus: 'active',
        mpStatus,
        action: 'status_corrected',
      });

      await supabaseAdmin
        .from('subscriptions')
        .update({ status: statusMap[mpStatus] })
        .eq('mp_preapproval_id', sub.mp_preapproval_id)
        .eq('status', 'active'); // Optimistic lock: only update if still active

      if (mpStatus === 'cancelled') {
        await supabaseAdmin
          .from('companies')
          .update({ is_subscribed: false, subscription_status: 'canceled' })
          .eq('id', sub.company_id);
      }
      return { synced: false, revoked: mpStatus === 'cancelled', discrepancy: true };
    }

    return { synced: false, revoked: false, discrepancy: false };
  } catch (err) {
    log.error(`Failed to sync MP subscription ${sub.mp_preapproval_id}`, {
      error: err instanceof Error ? err.message : String(err),
      companyId: sub.company_id,
    });
    return { synced: false, revoked: false, discrepancy: false };
  }
}

Deno.serve(async (req) => {
  const startTime = performance.now();

  try {
    // Accept the dedicated CRON secret and the legacy scheduler service-role token.
    if (!isAuthorizedCronRequest(req)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mpConfig = getMpConfig();
    const now = new Date().toISOString();
    let synced = 0;
    let revoked = 0;
    let discrepancies = 0;

    // 1. Check active MercadoPago subscriptions that may need syncing
    const { data: activeMpSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('mp_preapproval_id, company_id, next_billing_time')
      .eq('status', 'active')
      .not('mp_preapproval_id', 'is', null);

    if (activeMpSubscriptions) {
      for (const sub of activeMpSubscriptions) {
        if (sub.next_billing_time && new Date(sub.next_billing_time) > new Date()) {
          continue;
        }

        try {
          const result = await syncMpSubscription(sub, mpConfig);
          if (result.synced) synced++;
          if (result.revoked) revoked++;
          if (result.discrepancy) discrepancies++;
        } catch (err) {
          log.error(`Error syncing MP subscription ${sub.mp_preapproval_id}`, {
            error: err instanceof Error ? err.message : String(err),
            companyId: sub.company_id,
          });
        }
      }
    }

    // 2. Revoke access for cancelled subscriptions past their grace period
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

    const durationMs = Math.round(performance.now() - startTime);

    log.info('CRON complete', { synced, revoked, discrepancies, durationMs });

    return new Response(JSON.stringify({ success: true, synced, revoked, discrepancies }), {
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


