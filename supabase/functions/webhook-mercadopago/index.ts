/**
 * Edge Function: webhook-mercadopago
 * Handles MercadoPago webhook notifications for subscription lifecycle events.
 *
 * MercadoPago subscription webhooks send minimal payloads:
 *   { action, type: "subscription_preapproval", data: { id } }
 * We must fetch the full preapproval state via GET /preapproval/{id}.
 *
 * Signature validation uses x-signature header with HMAC-SHA256.
 */

import { corsHeaders } from '../_shared/cors.ts';
import {
  getMpConfig,
  getMpHeaders,
  mpFetch,
} from '../_shared/mp-auth.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { sendEmailSafe } from '../_shared/resend.ts';
import {
  paymentReceiptEmail,
  subscriptionCancelledEmail,
  subscriptionSuspendedEmail,
} from '../_shared/email-templates.ts';

/**
 * Validate webhook signature from x-signature header.
 * Format: "ts=TIMESTAMP,v1=HASH"
 * Manifest: "id:[data.id];request-id:[x-request-id];ts:[ts];"
 * IMPORTANT: data.id must be lowercase for hash validation.
 */
async function verifyWebhookSignature(
  headers: Headers,
  dataId: string,
  secret: string,
): Promise<boolean> {
  const xSignature = headers.get('x-signature');
  const xRequestId = headers.get('x-request-id');

  if (!xSignature || !xRequestId) {
    console.error('Missing x-signature or x-request-id headers');
    return false;
  }

  // Parse ts and v1 from x-signature
  const parts: Record<string, string> = {};
  for (const part of xSignature.split(',')) {
    const [key, value] = part.split('=', 2);
    if (key && value) parts[key.trim()] = value.trim();
  }

  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1) {
    console.error('Invalid x-signature format');
    return false;
  }

  // Build manifest — data.id must be lowercase per MP docs
  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;

  // HMAC-SHA256 using Web Crypto API
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest));
  const hash = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hash === v1;
}

/** Fetch subscriber info for email sending. */
async function getMpSubscriberInfo(mpPreapprovalId: string): Promise<{ email: string; name: string; planName: string; periodEnd: string | null } | null> {
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('subscriber_email, plan_name, plan_key, company_id, current_period_end')
    .eq('mp_preapproval_id', mpPreapprovalId)
    .single();

  if (!sub?.subscriber_email) return null;

  let name = 'Usuario';
  if (sub.company_id) {
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('user_id')
      .eq('id', sub.company_id)
      .single();
    if (company?.user_id) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(company.user_id);
      if (userData?.user) {
        name = userData.user.user_metadata?.name || userData.user.email || name;
      }
    }
  }

  return {
    email: sub.subscriber_email,
    name,
    planName: sub.plan_name || sub.plan_key || 'Plan',
    periodEnd: sub.current_period_end,
  };
}

async function fetchPreapprovalState(preapprovalId: string): Promise<Record<string, unknown> | null> {
  const config = getMpConfig();
  const headers = getMpHeaders();

  try {
    return await mpFetch<Record<string, unknown>>(
      `${config.baseUrl}/preapproval/${preapprovalId}`,
      { method: 'GET', headers },
    );
  } catch (error) {
    console.error(`Failed to fetch preapproval ${preapprovalId}:`, error);
    return null;
  }
}

async function syncSubscriptionState(
  preapprovalId: string,
  preapproval: Record<string, unknown>,
) {
  const mpStatus = preapproval.status as string;
  const now = new Date().toISOString();

  // Map MercadoPago status to our internal status
  let internalStatus: string;
  let companyUpdates: Record<string, unknown> = {};

  switch (mpStatus) {
    case 'authorized':
      internalStatus = 'active';
      companyUpdates = { is_subscribed: true, subscription_status: 'active' };
      break;
    case 'paused':
      internalStatus = 'suspended';
      companyUpdates = { is_subscribed: false, subscription_status: 'paused' };
      break;
    case 'cancelled':
      internalStatus = 'cancelled';
      companyUpdates = { subscription_status: 'canceled' };
      break;
    case 'pending':
      internalStatus = 'pending';
      break;
    default:
      console.log(`Unhandled MP status: ${mpStatus}`);
      return;
  }

  // Get existing subscription
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id, company_id, status')
    .eq('mp_preapproval_id', preapprovalId)
    .single();

  if (!existing) {
    console.error(`No subscription found for MP preapproval ${preapprovalId}`);
    return;
  }

  // Skip if already in target state (idempotency)
  if (existing.status === internalStatus) return;

  // Update subscription
  const subUpdates: Record<string, unknown> = { status: internalStatus };
  if (internalStatus === 'active') {
    subUpdates.activated_at = now;
    subUpdates.next_billing_time = (preapproval.next_payment_date as string) || null;
  }
  if (internalStatus === 'cancelled') subUpdates.cancelled_at = now;
  if (internalStatus === 'suspended') subUpdates.suspended_at = now;

  await supabaseAdmin
    .from('subscriptions')
    .update(subUpdates)
    .eq('mp_preapproval_id', preapprovalId);

  // Update company
  if (Object.keys(companyUpdates).length > 0) {
    await supabaseAdmin
      .from('companies')
      .update(companyUpdates)
      .eq('id', existing.company_id);
  }

  // Send status change emails
  if (internalStatus === 'cancelled' || internalStatus === 'suspended') {
    const info = await getMpSubscriberInfo(preapprovalId);
    if (info) {
      if (internalStatus === 'cancelled') {
        await sendEmailSafe({
          to: info.email,
          subject: 'Tu suscripción a Escuela Segura fue cancelada',
          html: subscriptionCancelledEmail(info.name, info.periodEnd),
        });
      } else {
        await sendEmailSafe({
          to: info.email,
          subject: 'Tu suscripción a Escuela Segura fue suspendida',
          html: subscriptionSuspendedEmail(info.name),
        });
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const notificationId = body.id as string;
    const action = body.action as string;
    const type = body.type as string;
    const dataId = (body.data?.id as string) || '';

    // Only handle subscription_preapproval events
    if (type !== 'subscription_preapproval' && type !== 'subscription_authorized_payment') {
      console.log(`Ignoring event type: ${type}`);
      return new Response(JSON.stringify({ status: 'ignored' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate webhook signature
    const config = getMpConfig();
    if (config.webhookSecret) {
      const isValid = await verifyWebhookSignature(
        req.headers,
        dataId,
        config.webhookSecret,
      );
      if (!isValid) {
        console.error('Webhook signature verification failed');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } },
        );
      }
    }

    // Idempotency check
    const { data: existingLog } = await supabaseAdmin
      .from('mp_webhook_log')
      .select('id, processed')
      .eq('notification_id', notificationId)
      .maybeSingle();

    if (existingLog?.processed) {
      return new Response(JSON.stringify({ status: 'already_processed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Log the event
    if (!existingLog) {
      await supabaseAdmin.from('mp_webhook_log').insert({
        notification_id: notificationId,
        action,
        type,
        data_id: dataId,
        payload: body,
      });
    }

    // Process event
    try {
      if (type === 'subscription_preapproval') {
        // Fetch full preapproval state from MP API
        const preapproval = await fetchPreapprovalState(dataId);
        if (preapproval) {
          await syncSubscriptionState(dataId, preapproval);
        }
      } else if (type === 'subscription_authorized_payment') {
        // Payment event — record in payment_transactions
        // Fetch payment details from MP
        const headers = getMpHeaders();
        try {
          const payment = await mpFetch<Record<string, unknown>>(
            `${config.baseUrl}/authorized_payments/${dataId}`,
            { method: 'GET', headers },
          );

          const preapprovalId = payment.preapproval_id as string;
          const transactionAmount = payment.transaction_amount as number;
          const currencyId = payment.currency_id as string;
          const paymentStatus = payment.status as string;
          const dateCreated = payment.date_created as string;

          // Get subscription
          const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('id, company_id')
            .eq('mp_preapproval_id', preapprovalId)
            .single();

          if (sub) {
            // Idempotency: check if transaction already recorded
            const { data: existingTx } = await supabaseAdmin
              .from('payment_transactions')
              .select('id')
              .eq('paypal_transaction_id', dataId)
              .maybeSingle();

            if (!existingTx) {
              await supabaseAdmin.from('payment_transactions').insert({
                subscription_id: sub.id,
                company_id: sub.company_id,
                paypal_transaction_id: dataId, // Reusing column for MP transaction ID
                gross_amount: transactionAmount || 0,
                currency: currencyId || 'ARS',
                status: paymentStatus === 'approved' ? 'completed' : 'pending',
                paid_at: dateCreated || new Date().toISOString(),
              });

              // Send payment receipt email
              if (paymentStatus === 'approved') {
                const info = await getMpSubscriberInfo(preapprovalId);
                if (info) {
                  await sendEmailSafe({
                    to: info.email,
                    subject: 'Recibo de pago — Escuela Segura',
                    html: paymentReceiptEmail(
                      info.name,
                      transactionAmount || 0,
                      currencyId || 'ARS',
                      dateCreated || new Date().toISOString(),
                      info.planName,
                    ),
                  });
                }
              }
            }
          }
        } catch (paymentErr) {
          console.error('Error processing payment event:', paymentErr);
        }
      }

      // Mark as processed
      await supabaseAdmin
        .from('mp_webhook_log')
        .update({ processed: true })
        .eq('notification_id', notificationId);
    } catch (processingError) {
      console.error(`Error processing ${type}/${action}:`, processingError);
      await supabaseAdmin
        .from('mp_webhook_log')
        .update({
          processing_error:
            processingError instanceof Error
              ? processingError.message
              : String(processingError),
        })
        .eq('notification_id', notificationId);
    }

    // Always return 200 to acknowledge receipt (required within 22 seconds)
    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('webhook-mercadopago error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
