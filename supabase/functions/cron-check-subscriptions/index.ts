// supabase/functions/cron-check-subscriptions/index.ts
// CRON job to monitor subscription statuses and deactivate expired ones.
// Should be called daily by an external CRON service (e.g., cron-job.org).
// Protected by CRON_SECRET header.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const responseHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

serve(async (req) => {
  try {
    const CRON_SECRET = Deno.env.get('CRON_SECRET');
    const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!CRON_SECRET || !MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: responseHeaders,
      });
    }

    // Validate CRON secret
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: responseHeaders,
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Find subscriptions that should be checked: pending, authorized, or paused
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('id, company_id, mp_preapproval_id, status, plan_id')
      .in('status', ['pending', 'authorized', 'paused'])
      .not('mp_preapproval_id', 'is', null);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: responseHeaders,
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions to check', checked: 0 }), {
        status: 200,
        headers: responseHeaders,
      });
    }

    const results: { id: string; companyId: string; action: string; mpStatus: string }[] = [];

    for (const sub of subscriptions) {
      try {
        // Check subscription status in MercadoPago
        const mpResponse = await fetch(
          `https://api.mercadopago.com/preapproval/${sub.mp_preapproval_id}`,
          {
            headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
          }
        );

        if (!mpResponse.ok) {
          console.warn(`Failed to fetch MP subscription ${sub.mp_preapproval_id}: ${mpResponse.status}`);
          continue;
        }

        const mpData = await mpResponse.json();
        const mpStatus = mpData.status;

        // Sync DB status if it differs from MP
        if (mpStatus !== sub.status) {
          await supabase
            .from('subscriptions')
            .update({
              status: mpStatus,
              next_payment_date: mpData.next_payment_date || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', sub.id);

          if (mpStatus === 'cancelled' || mpStatus === 'expired') {
            await supabase
              .from('companies')
              .update({
                subscription_status: 'canceled',
                is_subscribed: false,
              })
              .eq('id', sub.company_id);

            results.push({ id: sub.id, companyId: sub.company_id, action: 'deactivated', mpStatus });
          } else if (mpStatus === 'authorized') {
            await supabase
              .from('companies')
              .update({
                subscription_status: 'active',
                is_subscribed: true,
                selected_plan: sub.plan_id,
                subscription_renewal_date: mpData.next_payment_date || null,
              })
              .eq('id', sub.company_id);

            results.push({ id: sub.id, companyId: sub.company_id, action: 'activated', mpStatus });
          } else if (mpStatus === 'paused') {
            await supabase
              .from('companies')
              .update({ subscription_status: 'paused' })
              .eq('id', sub.company_id);

            results.push({ id: sub.id, companyId: sub.company_id, action: 'paused', mpStatus });
          }
        }
      } catch (err) {
        console.error(`Error checking subscription ${sub.id}:`, err);
      }
    }

    console.log(`CRON check complete. Checked: ${subscriptions.length}, Actions: ${results.length}`);

    return new Response(JSON.stringify({
      message: 'CRON check complete',
      checked: subscriptions.length,
      actions: results,
    }), {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('CRON error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal error',
    }), {
      status: 500,
      headers: responseHeaders,
    });
  }
});
