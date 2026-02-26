/**
 * Edge Function: mp-manage-subscription
 * Manages MercadoPago subscription lifecycle:
 * - change_plan: Upgrade/downgrade by changing transaction_amount
 * - change_card: Update payment card via new card_token_id
 * - cancel: Cancel subscription (status: cancelled)
 * - pause: Pause subscription (status: paused)
 * - reactivate: Reactivate paused subscription (status: authorized)
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
  isValidMpPlanKey,
  MP_PLAN_METADATA,
} from '../_shared/mp-plans.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { sendEmailSafe } from '../_shared/resend.ts';
import {
  cardChangedEmail,
  planChangedEmail,
  subscriptionCancelledEmail,
  subscriptionSuspendedEmail,
  subscriptionReactivatedEmail,
} from '../_shared/email-templates.ts';

type MpAction = 'change_plan' | 'change_card' | 'cancel' | 'pause' | 'reactivate';

const VALID_ACTIONS: MpAction[] = ['change_plan', 'change_card', 'cancel', 'pause', 'reactivate'];

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

    const { action, mpPreapprovalId, newPlanKey, cardTokenId, reason } = await req.json() as {
      action: string;
      mpPreapprovalId: string;
      newPlanKey?: string;
      cardTokenId?: string;
      reason?: string;
    };

    console.log('[MP] mp-manage-subscription: Request received', {
      action,
      mpPreapprovalId,
      newPlanKey,
      hasCardToken: !!cardTokenId,
      reason,
    });

    // Validate action
    if (!action || !VALID_ACTIONS.includes(action as MpAction)) {
      return new Response(
        JSON.stringify({ error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!mpPreapprovalId) {
      return new Response(
        JSON.stringify({ error: 'Missing mpPreapprovalId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Get existing subscription from DB
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, company_id, mp_preapproval_id, status, plan_key, plan_name, amount, currency, subscriber_email, current_period_end')
      .eq('mp_preapproval_id', mpPreapprovalId)
      .single();

    if (subError || !subscription) {
      console.error('[MP] mp-manage-subscription: Subscription not found', { mpPreapprovalId, subError });
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    console.log('[MP] mp-manage-subscription: Found subscription', {
      id: subscription.id,
      companyId: subscription.company_id,
      currentStatus: subscription.status,
      currentPlan: subscription.plan_key,
    });

    // Verify the user owns this company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', subscription.company_id)
      .eq('user_id', user.id)
      .single();

    if (companyError || !company) {
      return new Response(
        JSON.stringify({ error: 'Company not found or access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const config = getMpConfig();
    const headers = getMpHeaders({
      'X-Idempotency-Key': `mp-manage-${mpPreapprovalId}-${action}-${Date.now()}`,
    });
    const now = new Date().toISOString();

    // Build PUT body based on action
    let putBody: Record<string, unknown> = {};
    let dbUpdates: Record<string, unknown> = {};
    let companyUpdates: Record<string, unknown> = {};

    switch (action as MpAction) {
      case 'change_plan': {
        if (!newPlanKey || !isValidMpPlanKey(newPlanKey)) {
          return new Response(
            JSON.stringify({ error: 'Missing or invalid newPlanKey' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }

        if (newPlanKey === subscription.plan_key) {
          return new Response(
            JSON.stringify({ error: 'New plan is the same as current plan' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }

        const newPlanMeta = MP_PLAN_METADATA[newPlanKey];
        putBody = {
          auto_recurring: {
            transaction_amount: newPlanMeta.amount,
          },
        };

        // Optionally change card at the same time
        if (cardTokenId) {
          putBody.card_token_id = cardTokenId;
        }

        dbUpdates = {
          plan_key: newPlanKey,
          plan_name: newPlanMeta.name,
          amount: newPlanMeta.amount,
          currency: newPlanMeta.currency,
        };

        companyUpdates = {
          selected_plan: newPlanKey,
        };
        break;
      }

      case 'change_card': {
        if (!cardTokenId) {
          return new Response(
            JSON.stringify({ error: 'Missing cardTokenId for change_card action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }
        putBody = { card_token_id: cardTokenId };
        break;
      }

      case 'cancel': {
        putBody = { status: 'cancelled' };
        if (reason) putBody.reason = reason;
        dbUpdates = { status: 'cancelled', cancelled_at: now };
        companyUpdates = { subscription_status: 'canceled' };
        break;
      }

      case 'pause': {
        putBody = { status: 'paused' };
        if (reason) putBody.reason = reason;
        dbUpdates = { status: 'suspended', suspended_at: now };
        companyUpdates = { is_subscribed: false, subscription_status: 'paused' };
        break;
      }

      case 'reactivate': {
        putBody = { status: 'authorized' };
        dbUpdates = { status: 'active', suspended_at: null };
        companyUpdates = { is_subscribed: true, subscription_status: 'active' };
        break;
      }
    }

    // Call MercadoPago API
    console.log('[MP] mp-manage-subscription: Calling PUT /preapproval', {
      mpPreapprovalId,
      putBody,
    });
    const mpResult = await mpFetch(
      `${config.baseUrl}/preapproval/${mpPreapprovalId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(putBody),
      },
    );
    console.log('[MP] mp-manage-subscription: MP API response:', mpResult);

    // Sync next_billing_time from MP response for relevant actions
    const mpResponse = mpResult as Record<string, unknown>;
    if (mpResponse.next_payment_date) {
      dbUpdates.next_billing_time = mpResponse.next_payment_date;
    }

    // Update DB if we have changes
    if (Object.keys(dbUpdates).length > 0) {
      await supabaseAdmin
        .from('subscriptions')
        .update(dbUpdates)
        .eq('mp_preapproval_id', mpPreapprovalId);
    }

    if (Object.keys(companyUpdates).length > 0) {
      await supabaseAdmin
        .from('companies')
        .update(companyUpdates)
        .eq('id', subscription.company_id);
      console.log('[MP] mp-manage-subscription: Company updated', companyUpdates);
    }

    // Send email notifications
    const userName = user.user_metadata?.name || user.email || 'Usuario';
    const email = subscription.subscriber_email || user.email;
    if (email) {
      switch (action as MpAction) {
        case 'change_card':
          await sendEmailSafe({
            to: email,
            subject: 'Medio de pago actualizado — Escuela Segura',
            html: cardChangedEmail(userName, '****'),
          });
          break;
        case 'change_plan': {
          const oldPlanName = subscription.plan_name || subscription.plan_key || 'Plan anterior';
          const newMeta = MP_PLAN_METADATA[newPlanKey!];
          await sendEmailSafe({
            to: email,
            subject: 'Cambio de plan — Escuela Segura',
            html: planChangedEmail(userName, oldPlanName, newMeta.name, newMeta.amount, newMeta.currency),
          });
          break;
        }
        case 'cancel':
          await sendEmailSafe({
            to: email,
            subject: 'Tu suscripción a Escuela Segura fue cancelada',
            html: subscriptionCancelledEmail(userName, subscription.current_period_end || null),
          });
          break;
        case 'pause':
          await sendEmailSafe({
            to: email,
            subject: 'Tu suscripción a Escuela Segura fue suspendida',
            html: subscriptionSuspendedEmail(userName),
          });
          break;
        case 'reactivate':
          await sendEmailSafe({
            to: email,
            subject: '¡Tu suscripción a Escuela Segura fue reactivada!',
            html: subscriptionReactivatedEmail(userName, subscription.plan_name || subscription.plan_key || 'Plan'),
          });
          break;
      }
    }

    console.log('[MP] mp-manage-subscription: SUCCESS', { action, status: dbUpdates.status || subscription.status });
    return new Response(
      JSON.stringify({
        success: true,
        action,
        status: dbUpdates.status || subscription.status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('mp-manage-subscription error:', error);
    const message =
      error instanceof MercadoPagoError
        ? error.message
        : 'Error al gestionar la suscripcion';
    const status = error instanceof MercadoPagoError ? error.statusCode || 500 : 500;

    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
