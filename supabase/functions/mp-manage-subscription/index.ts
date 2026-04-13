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
import { getCorsHeaders } from '../_shared/cors.ts';
import { getSupabasePublishableKey } from '../_shared/supabase-keys.ts';
import { getMpConfig, getMpHeaders, mpFetch, MercadoPagoError } from '../_shared/mp-auth.ts';
import { isValidPlanKey, getPlanMetadataFromDb } from '../_shared/mp-plans.ts';
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

function sanitizeCardLastFour(value: unknown): string | null {
  return typeof value === 'string' && /^\d{4}$/.test(value.trim()) ? value.trim() : null;
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    // Verify JWT and get user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      getSupabasePublishableKey(),
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const {
      action,
      mpPreapprovalId,
      newPlanKey,
      cardTokenId,
      cardLastFour,
      idempotencyKey,
      reason,
    } =
      (await req.json()) as {
      action: string;
      mpPreapprovalId: string;
      newPlanKey?: string;
      cardTokenId?: string;
      cardLastFour?: string | null;
      idempotencyKey?: string;
      reason?: string;
    };

    console.log('[MP] mp-manage-subscription: Request received', {
      action,
      mpPreapprovalId,
      newPlanKey,
      hasCardToken: !!cardTokenId,
      hasCardLastFour: !!sanitizeCardLastFour(cardLastFour),
      reason,
    });

    // Validate action
    if (!action || !VALID_ACTIONS.includes(action as MpAction)) {
      return new Response(
        JSON.stringify({ error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}` }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const isValidMPId = (id: string) => /^[a-zA-Z0-9_-]{1,100}$/.test(id);
    if (!mpPreapprovalId) {
      return new Response(JSON.stringify({ error: 'Missing mpPreapprovalId' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    if (!isValidMPId(mpPreapprovalId)) {
      return new Response(JSON.stringify({ error: 'Formato de ID inválido' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Get existing subscription from DB
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select(
        'id, company_id, mp_preapproval_id, status, plan_key, plan_name, amount, currency, subscriber_email, current_period_end'
      )
      .eq('mp_preapproval_id', mpPreapprovalId)
      .single();

    if (subError || !subscription) {
      console.error('[MP] mp-manage-subscription: Subscription not found', {
        mpPreapprovalId,
        subError,
      });
      return new Response(JSON.stringify({ error: 'Subscription not found' }), {
        status: 404,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
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
      return new Response(JSON.stringify({ error: 'Company not found or access denied' }), {
        status: 403,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const config = getMpConfig();
    const requestId =
      req.headers.get('X-Idempotency-Key')?.trim() ||
      req.headers.get('Idempotency-Key')?.trim() ||
      idempotencyKey?.trim() ||
      crypto.randomUUID();
    const headers = getMpHeaders({
      'X-Idempotency-Key': `mp-manage-${mpPreapprovalId}-${action}-${requestId}`,
    });
    const now = new Date().toISOString();

    // Build PUT body based on action
    let putBody: Record<string, unknown> = {};
    let dbUpdates: Record<string, unknown> = {};
    let companyUpdates: Record<string, unknown> = {};
    let resolvedNewPlanMeta: { name: string; amount: number; currency: string } | null = null;

    switch (action as MpAction) {
      case 'change_plan': {
        if (!newPlanKey || !(await isValidPlanKey(newPlanKey))) {
          return new Response(JSON.stringify({ error: 'Missing or invalid newPlanKey' }), {
            status: 400,
            headers: { ...cors, 'Content-Type': 'application/json' },
          });
        }

        if (newPlanKey === subscription.plan_key) {
          return new Response(JSON.stringify({ error: 'New plan is the same as current plan' }), {
            status: 400,
            headers: { ...cors, 'Content-Type': 'application/json' },
          });
        }

        resolvedNewPlanMeta = await getPlanMetadataFromDb(newPlanKey);
        putBody = {
          auto_recurring: {
            transaction_amount: resolvedNewPlanMeta.amount,
          },
        };

        // Optionally change card at the same time
        if (cardTokenId) {
          putBody.card_token_id = cardTokenId;
        }

        dbUpdates = {
          plan_key: newPlanKey,
          plan_name: resolvedNewPlanMeta.name,
          amount: resolvedNewPlanMeta.amount,
          currency: resolvedNewPlanMeta.currency,
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
            { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
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
    const mpResult = await mpFetch(`${config.baseUrl}/preapproval/${mpPreapprovalId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody),
    });
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

    // Create in-app notifications
    if (action === 'change_plan' || action === 'change_card') {
      try {
        const oldPlanName = subscription.plan_name || subscription.plan_key || 'Plan anterior';
        const notif =
          action === 'change_plan'
            ? {
                company_id: subscription.company_id,
                user_id: user.id,
                type: 'info',
                category: 'payment',
                title: 'Plan actualizado',
                message: `Tu plan cambió de "${oldPlanName}" a "${resolvedNewPlanMeta!.name}".`,
                link: '/settings',
                is_read: false,
              }
            : {
                company_id: subscription.company_id,
                user_id: user.id,
                type: 'info',
                category: 'payment',
                title: 'Medio de pago actualizado',
                message: 'Tu medio de pago fue actualizado correctamente.',
                link: '/settings',
                is_read: false,
              };

        const { error: notifError } = await supabaseAdmin.from('notifications').insert(notif);

        if (notifError) {
          console.error(
            '[MP] mp-manage-subscription: Failed to create notification',
            notifError.message
          );
        }
      } catch (notifErr) {
        console.error('[MP] mp-manage-subscription: Notification error', notifErr);
      }
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
            html: cardChangedEmail(userName, sanitizeCardLastFour(cardLastFour)),
            idempotencyKey: `mp-change-card-${mpPreapprovalId}-${requestId}`,
            tags: [
              { name: 'event', value: 'card-changed' },
              { name: 'source', value: 'mp-manage-subscription' },
            ],
          });
          break;
        case 'change_plan': {
          const oldPlanName = subscription.plan_name || subscription.plan_key || 'Plan anterior';
          await sendEmailSafe({
            to: email,
            subject: 'Cambio de plan — Escuela Segura',
            html: planChangedEmail(
              userName,
              oldPlanName,
              resolvedNewPlanMeta!.name,
              resolvedNewPlanMeta!.amount,
              resolvedNewPlanMeta!.currency
            ),
            idempotencyKey: `mp-change-plan-${mpPreapprovalId}-${requestId}`,
            tags: [
              { name: 'event', value: 'plan-changed' },
              { name: 'source', value: 'mp-manage-subscription' },
            ],
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
            html: subscriptionReactivatedEmail(
              userName,
              subscription.plan_name || subscription.plan_key || 'Plan'
            ),
          });
          break;
      }
    }
    console.log('[MP] mp-manage-subscription: SUCCESS', {
      action,
      status: dbUpdates.status || subscription.status,
    });
    return new Response(
      JSON.stringify({
        success: true,
        action,
        status: dbUpdates.status || subscription.status,
      }),
      {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(
      'mp-manage-subscription error:',
      error instanceof MercadoPagoError ? error.message : error
    );
    const status = error instanceof MercadoPagoError ? error.statusCode || 500 : 500;

    return new Response(JSON.stringify({ error: 'Error al procesar la solicitud' }), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
