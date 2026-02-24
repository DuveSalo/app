/**
 * Edge Function: webhook-paypal
 * Handles PayPal webhook notifications for subscription lifecycle events.
 *
 * - Verifies webhook signature with PayPal API
 * - Logs events for idempotency and auditing
 * - Processes subscription status changes and payment events
 */

import { corsHeaders } from '../_shared/cors.ts';
import {
  getAuthHeaders,
  getPayPalConfig,
  paypalFetch,
} from '../_shared/paypal-auth.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';
import { sendEmailSafe } from '../_shared/resend.ts';
import {
  paymentReceiptEmail,
  subscriptionCancelledEmail,
  subscriptionSuspendedEmail,
} from '../_shared/email-templates.ts';

/** Fetch subscriber name and email for a subscription by paypal_subscription_id. */
async function getSubscriberInfo(paypalSubscriptionId: string): Promise<{ email: string; name: string; planName: string } | null> {
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('subscriber_email, plan_name, plan_key, company_id')
    .eq('paypal_subscription_id', paypalSubscriptionId)
    .single();

  if (!sub?.subscriber_email) return null;

  // Try to get user name from company owner
  let name = 'Usuario';
  if (sub.company_id) {
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('user_id, name')
      .eq('id', sub.company_id)
      .single();
    if (company?.user_id) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(company.user_id);
      if (userData?.user) {
        name = userData.user.user_metadata?.name || userData.user.email || name;
      }
    }
  }

  return { email: sub.subscriber_email, name, planName: sub.plan_name || sub.plan_key || 'Plan' };
}

async function verifyWebhookSignature(
  headers: Headers,
  body: unknown,
): Promise<boolean> {
  const config = getPayPalConfig();
  const authHeaders = await getAuthHeaders();

  const result = await paypalFetch<{ verification_status: string }>(
    `${config.baseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        auth_algo: headers.get('paypal-auth-algo'),
        cert_url: headers.get('paypal-cert-url'),
        transmission_id: headers.get('paypal-transmission-id'),
        transmission_sig: headers.get('paypal-transmission-sig'),
        transmission_time: headers.get('paypal-transmission-time'),
        webhook_id: config.webhookId,
        webhook_event: body,
      }),
    },
  );

  return result.verification_status === 'SUCCESS';
}

async function handleSubscriptionActivated(resource: Record<string, unknown>) {
  const subscriptionId = resource.id as string;
  const billingInfo = resource.billing_info as Record<string, unknown> | undefined;
  const subscriber = resource.subscriber as Record<string, unknown> | undefined;
  const startTime = resource.start_time as string | undefined;

  const nextBilling = (billingInfo?.next_billing_time as string) || null;
  const email = (subscriber?.email_address as string) || null;

  // Idempotency: check if already active
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('status, company_id, plan_key')
    .eq('paypal_subscription_id', subscriptionId)
    .single();

  if (existing?.status === 'active') return;

  const now = new Date().toISOString();

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'active',
      activated_at: now,
      next_billing_time: nextBilling,
      current_period_start: startTime || now,
      subscriber_email: email,
    })
    .eq('paypal_subscription_id', subscriptionId);

  if (existing?.company_id) {
    await supabaseAdmin
      .from('companies')
      .update({
        is_subscribed: true,
        subscription_status: 'active',
        selected_plan: existing.plan_key,
        subscription_renewal_date: nextBilling,
      })
      .eq('id', existing.company_id);
  }
}

async function handleSubscriptionCancelled(resource: Record<string, unknown>) {
  const subscriptionId = resource.id as string;
  const now = new Date().toISOString();

  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('company_id, current_period_end')
    .eq('paypal_subscription_id', subscriptionId)
    .single();

  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'cancelled', cancelled_at: now })
    .eq('paypal_subscription_id', subscriptionId);

  if (existing?.company_id) {
    // Keep access until period end (graceful cancellation)
    // The cron job will revoke access after period_end
    await supabaseAdmin
      .from('companies')
      .update({ subscription_status: 'canceled' })
      .eq('id', existing.company_id);
  }

  // Send cancellation email
  const info = await getSubscriberInfo(subscriptionId);
  if (info) {
    await sendEmailSafe({
      to: info.email,
      subject: 'Tu suscripción a Escuela Segura fue cancelada',
      html: subscriptionCancelledEmail(info.name, existing?.current_period_end || null),
    });
  }
}

async function handleSubscriptionSuspended(resource: Record<string, unknown>) {
  const subscriptionId = resource.id as string;
  const now = new Date().toISOString();

  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('company_id')
    .eq('paypal_subscription_id', subscriptionId)
    .single();

  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'suspended', suspended_at: now })
    .eq('paypal_subscription_id', subscriptionId);

  if (existing?.company_id) {
    await supabaseAdmin
      .from('companies')
      .update({
        is_subscribed: false,
        subscription_status: 'paused',
      })
      .eq('id', existing.company_id);
  }

  // Send suspension email
  const info = await getSubscriberInfo(subscriptionId);
  if (info) {
    await sendEmailSafe({
      to: info.email,
      subject: 'Tu suscripción a Escuela Segura fue suspendida',
      html: subscriptionSuspendedEmail(info.name),
    });
  }
}

async function handleSubscriptionExpired(resource: Record<string, unknown>) {
  const subscriptionId = resource.id as string;

  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('company_id')
    .eq('paypal_subscription_id', subscriptionId)
    .single();

  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'expired' })
    .eq('paypal_subscription_id', subscriptionId);

  if (existing?.company_id) {
    await supabaseAdmin
      .from('companies')
      .update({
        is_subscribed: false,
        subscription_status: 'expired',
      })
      .eq('id', existing.company_id);
  }
}

async function handlePaymentFailed(resource: Record<string, unknown>) {
  const subscriptionId = resource.id as string;

  try {
    await supabaseAdmin.rpc('increment_failed_payments', {
      p_paypal_subscription_id: subscriptionId,
    });
  } catch {
    // Fallback if RPC doesn't exist: manual increment
    const { data } = await supabaseAdmin
      .from('subscriptions')
      .select('failed_payments_count')
      .eq('paypal_subscription_id', subscriptionId)
      .single();

    if (data) {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          failed_payments_count: (data.failed_payments_count || 0) + 1,
        })
        .eq('paypal_subscription_id', subscriptionId);
    }
  }
}

async function handlePaymentCompleted(resource: Record<string, unknown>) {
  const billingAgreementId = resource.billing_agreement_id as string;
  const amount = resource.amount as Record<string, string> | undefined;
  const transactionId = resource.id as string;
  const createTime = resource.create_time as string | undefined;

  // Get subscription info
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('id, company_id')
    .eq('paypal_subscription_id', billingAgreementId)
    .single();

  if (!sub) return;

  // Idempotency: check if transaction already recorded
  const { data: existingTx } = await supabaseAdmin
    .from('payment_transactions')
    .select('id')
    .eq('paypal_transaction_id', transactionId)
    .single();

  if (existingTx) return;

  await supabaseAdmin.from('payment_transactions').insert({
    subscription_id: sub.id,
    company_id: sub.company_id,
    paypal_transaction_id: transactionId,
    gross_amount: parseFloat(amount?.total || '0'),
    currency: amount?.currency || 'USD',
    status: 'completed',
    paid_at: createTime || new Date().toISOString(),
  });

  // Send payment receipt email
  const info = await getSubscriberInfo(billingAgreementId);
  if (info) {
    await sendEmailSafe({
      to: info.email,
      subject: 'Recibo de pago — Escuela Segura',
      html: paymentReceiptEmail(
        info.name,
        parseFloat(amount?.total || '0'),
        amount?.currency || 'USD',
        createTime || new Date().toISOString(),
        info.planName,
      ),
    });
  }
}

async function handlePaymentRefunded(resource: Record<string, unknown>) {
  const transactionId = resource.id as string;

  await supabaseAdmin
    .from('payment_transactions')
    .update({ status: 'refunded' })
    .eq('paypal_transaction_id', transactionId);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(req.headers, body);
    if (!isValid) {
      console.error('Webhook signature verification failed');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const eventId = body.id as string;
    const eventType = body.event_type as string;
    const resource = body.resource as Record<string, unknown>;
    const resourceType = body.resource_type as string | undefined;
    const resourceId = resource?.id as string | undefined;

    // Log the webhook event
    const { data: existingLog } = await supabaseAdmin
      .from('paypal_webhook_log')
      .select('id, processed')
      .eq('event_id', eventId)
      .single();

    if (existingLog?.processed) {
      // Already processed - idempotency
      return new Response(JSON.stringify({ status: 'already_processed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!existingLog) {
      await supabaseAdmin.from('paypal_webhook_log').insert({
        event_id: eventId,
        event_type: eventType,
        resource_type: resourceType || null,
        resource_id: resourceId || null,
        payload: body,
      });
    }

    // Process event
    try {
      switch (eventType) {
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
          await handleSubscriptionActivated(resource);
          break;
        case 'BILLING.SUBSCRIPTION.CANCELLED':
          await handleSubscriptionCancelled(resource);
          break;
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
          await handleSubscriptionSuspended(resource);
          break;
        case 'BILLING.SUBSCRIPTION.EXPIRED':
          await handleSubscriptionExpired(resource);
          break;
        case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
          await handlePaymentFailed(resource);
          break;
        case 'PAYMENT.SALE.COMPLETED':
          await handlePaymentCompleted(resource);
          break;
        case 'PAYMENT.SALE.REFUNDED':
          await handlePaymentRefunded(resource);
          break;
        default:
          console.log(`Unhandled event type: ${eventType}`);
      }

      // Mark as processed
      await supabaseAdmin
        .from('paypal_webhook_log')
        .update({ processed: true })
        .eq('event_id', eventId);
    } catch (processingError) {
      console.error(`Error processing ${eventType}:`, processingError);
      await supabaseAdmin
        .from('paypal_webhook_log')
        .update({
          processing_error:
            processingError instanceof Error
              ? processingError.message
              : String(processingError),
        })
        .eq('event_id', eventId);
    }

    // Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('webhook-paypal error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
