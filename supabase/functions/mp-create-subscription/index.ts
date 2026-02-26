/**
 * Edge Function: mp-create-subscription
 * Creates a MercadoPago subscription (preapproval) with card_token_id.
 *
 * MercadoPago with card_token_id creates and charges in a single step.
 * The subscription is immediately active if the first payment succeeds.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getMpConfig,
  getMpHeaders,
  mpFetch,
  MercadoPagoError,
} from '../_shared/mp-auth.ts';
import {
  getMpPlanId,
  isValidMpPlanKey,
  MP_PLAN_METADATA,
} from '../_shared/mp-plans.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { sendEmailSafe } from '../_shared/resend.ts';
import { subscriptionActivatedEmail } from '../_shared/email-templates.ts';

async function cancelExistingMpSubscription(
  companyId: string,
  newPlanKey: string,
) {
  const { data: existingSub } = await supabaseAdmin
    .from('subscriptions')
    .select('mp_preapproval_id, status, plan_key')
    .eq('company_id', companyId)
    .eq('payment_provider', 'mercadopago')
    .in('status', ['active', 'pending'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existingSub?.mp_preapproval_id || existingSub.status !== 'active') {
    return;
  }

  try {
    const config = getMpConfig();
    const headers = getMpHeaders();

    const response = await fetch(
      `${config.baseUrl}/preapproval/${existingSub.mp_preapproval_id}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: 'cancelled',
          reason: `Plan change from ${existingSub.plan_key} to ${newPlanKey}`,
        }),
      },
    );

    if (response.ok || response.status === 200) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('mp_preapproval_id', existingSub.mp_preapproval_id);
    } else {
      console.error(
        `Failed to cancel old MP subscription ${existingSub.mp_preapproval_id}: HTTP ${response.status}`,
      );
    }
  } catch (cancelErr) {
    console.error('Error cancelling old MP subscription for plan change:', cancelErr);
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

    const { planKey, companyId, cardTokenId, payerEmail } = await req.json() as {
      planKey: string;
      companyId: string;
      cardTokenId: string;
      payerEmail: string;
    };

    console.log('[MP] mp-create-subscription: Request received', {
      planKey,
      companyId,
      hasCardToken: !!cardTokenId,
      payerEmail,
    });

    // Validate required fields
    if (!planKey || !companyId || !cardTokenId || !payerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: planKey, companyId, cardTokenId, payerEmail' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!isValidMpPlanKey(planKey)) {
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

    // Cancel existing active MP subscription if this is a plan change
    console.log('[MP] mp-create-subscription: Checking for existing active MP subscription...');
    await cancelExistingMpSubscription(companyId, planKey);

    // Create MercadoPago preapproval subscription
    const mpPlanId = getMpPlanId(planKey);
    const planMeta = MP_PLAN_METADATA[planKey];
    const config = getMpConfig();
    console.log('[MP] mp-create-subscription: Creating preapproval', {
      mpPlanId,
      planName: planMeta.name,
      amount: planMeta.amount,
      currency: planMeta.currency,
      mode: config.mode,
    });

    const headers = getMpHeaders({
      'X-Idempotency-Key': `mp-sub-${companyId}-${planKey}-${Date.now()}`,
    });

    const preapproval = await mpFetch<{
      id: string;
      status: string;
      init_point: string;
      date_created: string;
      next_payment_date?: string;
    }>(
      `${config.baseUrl}/preapproval`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          preapproval_plan_id: mpPlanId,
          reason: `Escuela Segura - Plan ${planMeta.name}`,
          external_reference: companyId,
          payer_email: payerEmail,
          card_token_id: cardTokenId,
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: planMeta.amount,
            currency_id: planMeta.currency,
          },
          back_url: `${config.mode === 'sandbox' ? 'http://localhost:3000' : 'https://escuelasegura.com'}/#/subscribe`,
          status: 'authorized',
        }),
      },
    );

    // With card_token_id + status: authorized, MP charges immediately.
    // If we get here without error, the subscription is active.
    console.log('[MP] mp-create-subscription: Preapproval created', {
      preapprovalId: preapproval.id,
      status: preapproval.status,
      nextPaymentDate: preapproval.next_payment_date,
    });
    const now = new Date().toISOString();

    const { error: insertError } = await supabaseAdmin.from('subscriptions').insert({
      company_id: companyId,
      payment_provider: 'mercadopago',
      mp_preapproval_id: preapproval.id,
      mp_plan_id: mpPlanId,
      plan_key: planKey,
      plan_name: planMeta.name,
      amount: planMeta.amount,
      currency: planMeta.currency,
      status: preapproval.status === 'authorized' ? 'active' : 'pending',
      subscriber_email: payerEmail,
      activated_at: preapproval.status === 'authorized' ? now : null,
      current_period_start: now,
      next_billing_time: preapproval.next_payment_date || null,
    });

    if (insertError) {
      console.error(
        `[MP] mp-create-subscription: DB insert FAILED for preapproval ${preapproval.id}:`,
        insertError.message,
      );
    } else {
      console.log('[MP] mp-create-subscription: DB subscription record inserted');
    }

    // Update company subscription status
    if (preapproval.status === 'authorized') {
      await supabaseAdmin
        .from('companies')
        .update({
          is_subscribed: true,
          subscription_status: 'active',
          selected_plan: planKey,
          subscription_renewal_date: preapproval.next_payment_date || null,
        })
        .eq('id', companyId);
      console.log('[MP] mp-create-subscription: Company updated to subscribed');

      // Send subscription activated email
      await sendEmailSafe({
        to: payerEmail,
        subject: '¡Tu suscripción a Escuela Segura está activa!',
        html: subscriptionActivatedEmail(
          user.user_metadata?.name || user.email || 'Usuario',
          planMeta.name,
          planMeta.amount,
          planMeta.currency,
        ),
      });
    }

    console.log('[MP] mp-create-subscription: SUCCESS', { subscriptionId: preapproval.id, status: preapproval.status });
    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: preapproval.id,
        status: preapproval.status === 'authorized' ? 'active' : preapproval.status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('mp-create-subscription error:', error);
    const message =
      error instanceof MercadoPagoError
        ? error.message
        : 'Error al crear la suscripcion';
    const status = error instanceof MercadoPagoError ? error.statusCode || 500 : 500;

    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
