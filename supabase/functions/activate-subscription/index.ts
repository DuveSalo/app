/**
 * Edge Function: activate-subscription
 * Verifies a PayPal subscription after user approval and activates it.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getAuthHeaders,
  getPayPalConfig,
  paypalFetch,
  PayPalError,
} from '../_shared/paypal-auth.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { sendEmailSafe } from '../_shared/resend.ts';
import { subscriptionActivatedEmail, planChangedEmail } from '../_shared/email-templates.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify JWT
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

    const { subscriptionId, companyId, oldPlanName } = await req.json() as {
      subscriptionId: string;
      companyId: string;
      oldPlanName?: string;
    };

    if (!subscriptionId || !companyId) {
      return new Response(
        JSON.stringify({ error: 'Missing subscriptionId or companyId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Verify user owns this company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .eq('user_id', user.id)
      .single();

    if (!company) {
      return new Response(
        JSON.stringify({ error: 'Company not found or access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Verify subscription with PayPal API
    const config = getPayPalConfig();
    const requestId = `activate-${subscriptionId}-${Date.now()}`;
    const headers = await getAuthHeaders({ 'PayPal-Request-Id': requestId });

    const paypalSub = await paypalFetch<{
      id: string;
      status: string;
      plan_id: string;
      billing_info?: {
        next_billing_time?: string;
        last_payment?: { time: string };
      };
      start_time?: string;
      subscriber?: { email_address?: string };
    }>(
      `${config.baseUrl}/v1/billing/subscriptions/${subscriptionId}?fields=last_failed_payment,plan`,
      { headers },
    );

    // Check if already activated (idempotency)
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('paypal_subscription_id', subscriptionId)
      .single();

    if (existingSub?.status === 'active') {
      return new Response(
        JSON.stringify({ success: true, status: 'active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    let result;

    if (paypalSub.status === 'ACTIVE') {
      const now = new Date().toISOString();
      const nextBilling = paypalSub.billing_info?.next_billing_time || null;

      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          activated_at: now,
          next_billing_time: nextBilling,
          current_period_start: paypalSub.start_time || now,
          subscriber_email: paypalSub.subscriber?.email_address || user.email,
        })
        .eq('paypal_subscription_id', subscriptionId);

      const { data: subRecord } = await supabaseAdmin
        .from('subscriptions')
        .select('plan_key, plan_name, amount, currency')
        .eq('paypal_subscription_id', subscriptionId)
        .single();

      await supabaseAdmin
        .from('companies')
        .update({
          is_subscribed: true,
          subscription_status: 'active',
          selected_plan: subRecord?.plan_key || null,
          subscription_renewal_date: nextBilling,
        })
        .eq('id', companyId);

      // Send email: plan change or new subscription activation
      const subscriberEmail = paypalSub.subscriber?.email_address || user.email;
      const userName = user.user_metadata?.name || user.email || 'Usuario';
      if (subscriberEmail) {
        if (oldPlanName) {
          // This is a plan change — send planChangedEmail
          await sendEmailSafe({
            to: subscriberEmail,
            subject: 'Cambio de plan — Escuela Segura',
            html: planChangedEmail(
              userName,
              oldPlanName,
              subRecord?.plan_name || subRecord?.plan_key || 'Plan',
              subRecord?.amount || 0,
              subRecord?.currency || 'USD',
            ),
          });
        } else {
          // New subscription — send activation email
          await sendEmailSafe({
            to: subscriberEmail,
            subject: '¡Tu suscripción a Escuela Segura está activa!',
            html: subscriptionActivatedEmail(
              userName,
              subRecord?.plan_name || subRecord?.plan_key || 'Plan',
              subRecord?.amount || 0,
              subRecord?.currency || 'USD',
            ),
          });
        }
      }

      result = { success: true, status: 'active' };
    } else if (paypalSub.status === 'APPROVAL_PENDING' || paypalSub.status === 'APPROVED') {
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'approval_pending' })
        .eq('paypal_subscription_id', subscriptionId);

      result = {
        success: true,
        status: 'pending',
        message: 'La suscripción está siendo procesada. Se activará en breve.',
      };
    } else {
      result = {
        success: false,
        status: paypalSub.status,
        message: `Estado inesperado de la suscripción: ${paypalSub.status}`,
      };
    }

    const statusCode = result.success ? 200 : 400;

    return new Response(
      JSON.stringify(result),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('activate-subscription error:', error);
    const message =
      error instanceof PayPalError
        ? error.message
        : 'Error al activar la suscripción';

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
