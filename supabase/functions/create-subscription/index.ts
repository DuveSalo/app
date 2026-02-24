/**
 * Edge Function: create-subscription
 * Creates a PayPal subscription via API and returns the subscriptionId
 * for the JS SDK to show the approval popup.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getAuthHeaders,
  getPayPalConfig,
  paypalFetch,
  PayPalError,
} from '../_shared/paypal-auth.ts';
import {
  getPayPalPlanId,
  isValidPlanKey,
  PLAN_METADATA,
} from '../_shared/paypal-plans.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';

async function cancelExistingSubscription(
  companyId: string,
  newPlanKey: string,
) {
  const { data: existingSub } = await supabaseAdmin
    .from('subscriptions')
    .select('paypal_subscription_id, status, plan_key')
    .eq('company_id', companyId)
    .in('status', ['active', 'approval_pending', 'pending'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existingSub?.paypal_subscription_id || existingSub.status !== 'active') {
    return;
  }

  try {
    const config = getPayPalConfig();
    const cancelRequestId = `cancel-for-upgrade-${existingSub.paypal_subscription_id}-${Date.now()}`;
    const cancelHeaders = await getAuthHeaders({ 'PayPal-Request-Id': cancelRequestId });

    const cancelResponse = await fetch(
      `${config.baseUrl}/v1/billing/subscriptions/${existingSub.paypal_subscription_id}/cancel`,
      {
        method: 'POST',
        headers: cancelHeaders,
        body: JSON.stringify({ reason: `Plan change from ${existingSub.plan_key} to ${newPlanKey}` }),
      },
    );

    const cancelDebugId = cancelResponse.headers.get('paypal-debug-id');
    if (cancelDebugId) {
      console.log(`PayPal cancel-for-upgrade debug-id: ${cancelDebugId}`);
    }

    if (cancelResponse.ok || cancelResponse.status === 204) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('paypal_subscription_id', existingSub.paypal_subscription_id);
    } else {
      console.error(`Failed to cancel old subscription ${existingSub.paypal_subscription_id}: HTTP ${cancelResponse.status}`);
    }
  } catch (cancelErr) {
    console.error('Error cancelling old subscription for plan change:', cancelErr);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify JWT and get user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { planKey, companyId } = await req.json() as {
      planKey: string;
      companyId: string;
    };

    if (!planKey || !companyId) {
      return new Response(
        JSON.stringify({ error: 'Missing planKey or companyId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!isValidPlanKey(planKey)) {
      return new Response(
        JSON.stringify({ error: `Invalid plan key: ${planKey}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Verify the user owns this company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .eq('user_id', user.id)
      .single();

    if (companyError || !company) {
      return new Response(
        JSON.stringify({ error: 'Company not found or access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Cancel existing active subscription if this is a plan change
    await cancelExistingSubscription(companyId, planKey);

    // Create PayPal subscription
    const paypalPlanId = getPayPalPlanId(planKey);
    const planMeta = PLAN_METADATA[planKey];
    const config = getPayPalConfig();

    const requestId = `sub-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const headers = await getAuthHeaders({ 'PayPal-Request-Id': requestId });

    const paypalSubscription = await paypalFetch<{
      id: string;
      status: string;
    }>(
      `${config.baseUrl}/v1/billing/subscriptions`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          plan_id: paypalPlanId,
          custom_id: companyId,
          subscriber: {
            email_address: user.email,
          },
          application_context: {
            brand_name: 'Escuela Segura',
            locale: 'es-AR',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            payment_method: {
              payer_selected: 'PAYPAL',
              payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
            },
            return_url: `${config.baseUrl === 'https://api-m.sandbox.paypal.com' ? 'http://localhost:3000' : 'https://escuelasegura.com'}/#/subscribe/callback`,
            cancel_url: `${config.baseUrl === 'https://api-m.sandbox.paypal.com' ? 'http://localhost:3000' : 'https://escuelasegura.com'}/#/subscribe`,
          },
        }),
      },
    );

    const { error: insertError } = await supabase.from('subscriptions').insert({
      company_id: companyId,
      paypal_subscription_id: paypalSubscription.id,
      paypal_plan_id: paypalPlanId,
      plan_key: planKey,
      plan_name: planMeta.name,
      amount: planMeta.amount,
      currency: planMeta.currency,
      status: 'pending',
      subscriber_email: user.email,
    });

    if (insertError) {
      console.error(
        `Failed to insert subscription record for PayPal sub ${paypalSubscription.id}:`,
        insertError.message,
        '— webhook BILLING.SUBSCRIPTION.ACTIVATED will handle DB state recovery',
      );
    }

    return new Response(
      JSON.stringify({ subscriptionId: paypalSubscription.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('create-subscription error:', error);
    const message =
      error instanceof PayPalError
        ? error.message
        : 'Error al crear la suscripción';
    const status = error instanceof PayPalError ? error.statusCode || 500 : 500;

    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
