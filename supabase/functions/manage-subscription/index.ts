/**
 * Edge Function: manage-subscription
 * Handles PayPal subscription lifecycle: cancel, suspend, reactivate.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getAuthHeaders,
  getPayPalConfig,
  PayPalError,
} from '../_shared/paypal-auth.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { STATUS_MAP, VALID_TRANSITIONS } from '../_shared/status-maps.ts';
import { sendEmailSafe } from '../_shared/resend.ts';
import {
  subscriptionCancelledEmail,
  subscriptionSuspendedEmail,
  subscriptionReactivatedEmail,
} from '../_shared/email-templates.ts';

type Action = 'cancel' | 'suspend' | 'reactivate';

const ACTION_ENDPOINTS: Record<Action, string> = {
  cancel: 'cancel',
  suspend: 'suspend',
  reactivate: 'activate',
};

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

    const { action, subscriptionId, reason } = (await req.json()) as {
      action: Action;
      subscriptionId: string;
      reason?: string;
    };

    if (!action || !subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Missing action or subscriptionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!ACTION_ENDPOINTS[action]) {
      return new Response(
        JSON.stringify({ error: `Invalid action: ${action}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Get subscription (include status for transition validation + email info)
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('company_id, status, subscriber_email, plan_name, plan_key, current_period_end')
      .eq('paypal_subscription_id', subscriptionId)
      .single();

    if (!sub) {
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Validate state transition
    if (!VALID_TRANSITIONS[action]?.includes(sub.status)) {
      return new Response(
        JSON.stringify({ error: `Cannot ${action} subscription in status '${sub.status}'` }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Verify user owns the subscription's company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('id', sub.company_id)
      .eq('user_id', user.id)
      .single();

    if (!company) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Call PayPal API
    const config = getPayPalConfig();
    const endpoint = ACTION_ENDPOINTS[action];
    const requestId = `${action}-${subscriptionId}-${Date.now()}`;
    const headers = await getAuthHeaders({ 'PayPal-Request-Id': requestId });

    const response = await fetch(
      `${config.baseUrl}/v1/billing/subscriptions/${subscriptionId}/${endpoint}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: reason || `User requested ${action}` }),
      },
    );

    const debugId = response.headers.get('paypal-debug-id') || undefined;
    if (debugId) {
      console.log(`PayPal ${action} debug-id: ${debugId}`);
    }

    if (!response.ok && response.status !== 204) {
      const errorBody = await response.json().catch(() => ({}));
      throw new PayPalError(
        errorBody.name || 'API_ERROR',
        errorBody.message || `Failed to ${action} subscription`,
        response.status,
        debugId,
      );
    }

    // Update local DB using centralized status maps
    const now = new Date().toISOString();
    const mapping = STATUS_MAP[action];

    const updateData: Record<string, unknown> = {
      status: mapping.subscription,
    };

    if (action === 'cancel') updateData.cancelled_at = now;
    if (action === 'suspend') updateData.suspended_at = now;
    if (action === 'reactivate') {
      updateData.suspended_at = null;
      updateData.activated_at = now;
    }

    await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('paypal_subscription_id', subscriptionId);

    await supabaseAdmin
      .from('companies')
      .update({
        subscription_status: mapping.company,
        is_subscribed: action !== 'suspend',
      })
      .eq('id', sub.company_id);

    // Send email notification
    const userName = user.user_metadata?.name || user.email || 'Usuario';
    const planName = sub.plan_name || sub.plan_key || 'Plan';
    if (sub.subscriber_email) {
      if (action === 'cancel') {
        await sendEmailSafe({
          to: sub.subscriber_email,
          subject: 'Tu suscripción a Escuela Segura fue cancelada',
          html: subscriptionCancelledEmail(userName, sub.current_period_end || null),
        });
      } else if (action === 'suspend') {
        await sendEmailSafe({
          to: sub.subscriber_email,
          subject: 'Tu suscripción a Escuela Segura fue suspendida',
          html: subscriptionSuspendedEmail(userName),
        });
      } else if (action === 'reactivate') {
        await sendEmailSafe({
          to: sub.subscriber_email,
          subject: '¡Tu suscripción a Escuela Segura fue reactivada!',
          html: subscriptionReactivatedEmail(userName, planName),
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, action, status: mapping.subscription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('manage-subscription error:', error);
    const message =
      error instanceof PayPalError
        ? error.message
        : 'Error al gestionar la suscripción';

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
