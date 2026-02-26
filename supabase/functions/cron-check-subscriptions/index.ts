/**
 * Edge Function: cron-check-subscriptions
 * Daily CRON job to sync subscription states with MercadoPago.
 *
 * - Checks active subscriptions whose period may have ended
 * - Revokes access for cancelled subscriptions past their grace period
 * - Syncs stale subscription data with MercadoPago API
 */

import {
  getMpConfig,
  getMpHeaders,
  mpFetch,
} from '../_shared/mp-auth.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';

async function syncMpSubscription(
  sub: { mp_preapproval_id: string; company_id: string },
  config: { baseUrl: string },
) {
  const headers = getMpHeaders();

  try {
    const preapproval = await mpFetch<Record<string, unknown>>(
      `${config.baseUrl}/preapproval/${sub.mp_preapproval_id}`,
      { method: 'GET', headers },
    );

    const mpStatus = preapproval.status as string;

    if (mpStatus === 'authorized') {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          next_billing_time: (preapproval.next_payment_date as string) || null,
        })
        .eq('mp_preapproval_id', sub.mp_preapproval_id);
      return { synced: true, revoked: false };
    }

    if (mpStatus === 'cancelled' || mpStatus === 'paused') {
      const statusMap: Record<string, string> = {
        cancelled: 'cancelled',
        paused: 'suspended',
      };

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
      return { synced: false, revoked: mpStatus === 'cancelled' };
    }

    return { synced: false, revoked: false };
  } catch (err) {
    console.error(`Failed to sync MP subscription ${sub.mp_preapproval_id}:`, err);
    return { synced: false, revoked: false };
  }
}

Deno.serve(async (req) => {
  try {
    // Verify this is called by service role (CRON or admin)
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey || authHeader !== `Bearer ${serviceRoleKey}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mpConfig = getMpConfig();
    const now = new Date().toISOString();
    let synced = 0;
    let revoked = 0;

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
        } catch (err) {
          console.error(
            `Error syncing MP subscription ${sub.mp_preapproval_id}:`,
            err,
          );
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

    console.log(
      `CRON check complete: ${synced} synced, ${revoked} revoked`,
    );

    return new Response(
      JSON.stringify({ success: true, synced, revoked }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('cron-check-subscriptions error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
