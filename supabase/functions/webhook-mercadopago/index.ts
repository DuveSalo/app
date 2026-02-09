// supabase/functions/webhook-mercadopago/index.ts
// REST NOTE: Webhook receiver - not a REST resource endpoint.
// Accepts POST notifications from MercadoPago payment gateway.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:3000';

const responseHeaders = {
  'Access-Control-Allow-Origin': APP_URL,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-API-Version': '1',
};

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
): Response {
  return new Response(JSON.stringify({
    error: code,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  }), { status, headers: responseHeaders });
}

/**
 * Validates the MercadoPago webhook signature using HMAC-SHA256.
 * @see https://www.mercadopago.com.ar/developers/en/docs/your-integrations/notifications/webhooks#verification
 */
async function validateWebhookSignature(
  req: Request,
  webhookSecret: string
): Promise<boolean> {
  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');

  if (!xSignature || !xRequestId) {
    console.warn('Missing x-signature or x-request-id headers');
    return false;
  }

  // Parse x-signature: ts=TIMESTAMP,v1=HASH
  const parts: Record<string, string> = {};
  for (const part of xSignature.split(',')) {
    const [key, ...valueParts] = part.split('=');
    parts[key.trim()] = valueParts.join('=').trim();
  }

  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) {
    console.error('Invalid x-signature format');
    return false;
  }

  // Get data.id from query parameters (used by MP in signature)
  const url = new URL(req.url);
  const dataId = url.searchParams.get('data.id') || '';

  // Build the manifest string per MercadoPago docs
  let manifest = '';
  if (dataId) manifest += `id:${dataId};`;
  manifest += `request-id:${xRequestId};`;
  manifest += `ts:${ts};`;

  // Compute HMAC-SHA256 using Web Crypto API
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(manifest)
  );

  // Convert to hex and compare
  const computedHash = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return computedHash === v1;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: responseHeaders });
  }

  const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const WEBHOOK_SECRET = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');

  if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing environment variables');
    return errorResponse(500, 'CONFIG_ERROR', 'Configuracion del servidor incompleta');
  }

  // Validate webhook signature if secret is configured
  if (WEBHOOK_SECRET) {
    const isValid = await validateWebhookSignature(req, WEBHOOK_SECRET);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return errorResponse(401, 'INVALID_SIGNATURE', 'Firma del webhook invalida');
    }
  } else {
    console.warn('MERCADOPAGO_WEBHOOK_SECRET not set - skipping signature validation');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const mpHeaders = { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` };

  try {
    const body = await req.json();
    const { type, data } = body;

    console.log('Webhook received:', type, data?.id);

    // Handle payment notifications
    if (type === 'payment') {
      const paymentResp = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        { headers: mpHeaders }
      );
      if (!paymentResp.ok) {
        console.error('Failed to fetch payment from MP:', data.id, paymentResp.status);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: responseHeaders,
        });
      }
      const payment = await paymentResp.json();

      // Find subscription by preapproval_id or external_reference (parallel queries)
      const subscriptionQueries = [];

      if (payment.metadata?.preapproval_id) {
        subscriptionQueries.push(
          supabase
            .from('subscriptions')
            .select('id, company_id')
            .eq('mp_preapproval_id', payment.metadata.preapproval_id)
            .single()
        );
      }

      if (payment.external_reference) {
        subscriptionQueries.push(
          supabase
            .from('subscriptions')
            .select('id, company_id')
            .eq('company_id', payment.external_reference)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        );
      }

      // Execute queries in parallel and take first successful result
      const results = await Promise.all(subscriptionQueries);
      const subscription = results.find(r => r.data)?.data || null;

      // Save payment transaction using UPSERT to handle duplicate webhooks
      if (subscription) {
        await supabase.from('payment_transactions').upsert(
          {
            subscription_id: subscription.id,
            company_id: subscription.company_id,
            mp_payment_id: payment.id?.toString(),
            mp_order_id: payment.order?.id?.toString(),
            amount: payment.transaction_amount,
            status: payment.status,
            status_detail: payment.status_detail,
            payment_method: payment.payment_method_id,
            payment_type: payment.payment_type_id,
            date_approved: payment.date_approved,
            mp_response: payment,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'mp_payment_id',
            ignoreDuplicates: false, // Update existing record
          }
        );

        if (payment.status === 'approved') {
          // Payment approved - sync renewal date from preapproval if available
          const preapprovalId = payment.metadata?.preapproval_id;
          if (preapprovalId) {
            const preapprovalResp = await fetch(
              `https://api.mercadopago.com/preapproval/${preapprovalId}`,
              { headers: mpHeaders }
            );
            if (preapprovalResp.ok) {
              const preapproval = await preapprovalResp.json();
              if (preapproval.next_payment_date) {
                await supabase
                  .from('companies')
                  .update({ subscription_renewal_date: preapproval.next_payment_date })
                  .eq('id', subscription.company_id);
              }
            } else {
              console.warn('Could not fetch preapproval for renewal date sync:', preapprovalResp.status);
            }
          }
        } else if (payment.status === 'rejected') {
          // Payment rejected - pause subscription and company
          await Promise.all([
            supabase
              .from('subscriptions')
              .update({ status: 'paused', updated_at: new Date().toISOString() })
              .eq('id', subscription.id),
            supabase
              .from('companies')
              .update({ subscription_status: 'paused' })
              .eq('id', subscription.company_id),
          ]);
        }
      } else {
        console.log('No subscription found for payment:', payment.id);
      }
    }

    // Handle subscription (preapproval) status changes
    if (type === 'subscription_preapproval') {
      const preapprovalResp = await fetch(
        `https://api.mercadopago.com/preapproval/${data.id}`,
        { headers: mpHeaders }
      );
      if (!preapprovalResp.ok) {
        console.error('Failed to fetch preapproval from MP:', data.id, preapprovalResp.status);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: responseHeaders,
        });
      }
      const preapproval = await preapprovalResp.json();

      // Update subscription in our database and read plan_id for sync
      const { data: sub } = await supabase
        .from('subscriptions')
        .update({
          status: preapproval.status,
          next_payment_date: preapproval.next_payment_date,
          updated_at: new Date().toISOString(),
        })
        .eq('mp_preapproval_id', data.id)
        .select('company_id, plan_id')
        .single();

      // Update company based on subscription status
      if (sub) {
        if (preapproval.status === 'authorized') {
          // Subscription is now active - grant access and sync plan + renewal date
          await supabase
            .from('companies')
            .update({
              subscription_status: 'active',
              is_subscribed: true,
              selected_plan: sub.plan_id,
              subscription_renewal_date: preapproval.next_payment_date || null,
            })
            .eq('id', sub.company_id);
          console.log('Company subscription activated:', sub.company_id, 'plan:', sub.plan_id);
        } else if (['cancelled', 'expired'].includes(preapproval.status)) {
          // Subscription ended - revoke access
          await supabase
            .from('companies')
            .update({
              subscription_status: 'canceled',
              is_subscribed: false,
            })
            .eq('id', sub.company_id);
          console.log('Company subscription deactivated:', sub.company_id);
        } else if (preapproval.status === 'paused') {
          // Subscription paused - keep is_subscribed true temporarily
          await supabase
            .from('companies')
            .update({
              subscription_status: 'paused',
            })
            .eq('id', sub.company_id);
          console.log('Company subscription paused:', sub.company_id);
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to MP to avoid retries for malformed payloads
    return new Response(JSON.stringify({ received: true, error: 'Processing error' }), {
      status: 200,
      headers: responseHeaders,
    });
  }
});
