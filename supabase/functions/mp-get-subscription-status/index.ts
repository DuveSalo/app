/**
 * Edge Function: mp-get-subscription-status
 * Fetches fresh subscription state from MercadoPago API.
 * Returns: next_payment_date, card brand, card last 4 digits.
 * Also syncs next_billing_time in the DB.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getMpConfig,
  getMpHeaders,
  mpFetch,
} from '../_shared/mp-auth.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    const { mpPreapprovalId } = await req.json() as { mpPreapprovalId: string };
    if (!mpPreapprovalId) {
      return new Response(
        JSON.stringify({ error: 'Missing mpPreapprovalId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Get subscription and verify ownership
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, company_id')
      .eq('mp_preapproval_id', mpPreapprovalId)
      .single();

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', subscription.company_id)
      .eq('user_id', user.id)
      .single();

    if (companyError || !company) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Fetch preapproval from MercadoPago
    const config = getMpConfig();
    const headers = getMpHeaders();
    const preapproval = await mpFetch<Record<string, unknown>>(
      `${config.baseUrl}/preapproval/${mpPreapprovalId}`,
      { method: 'GET', headers },
    );

    const nextPaymentDate = (preapproval.next_payment_date as string) || null;
    const paymentMethodId = (preapproval.payment_method_id as string) || null;
    const payerId = preapproval.payer_id as number | null;
    const cardId = preapproval.card_id as number | null;

    // Sync next_billing_time in DB
    if (nextPaymentDate) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ next_billing_time: nextPaymentDate })
        .eq('mp_preapproval_id', mpPreapprovalId);
    }

    // Try to get card last 4 digits
    let cardLastFour: string | null = null;
    if (payerId && cardId) {
      try {
        const card = await mpFetch<Record<string, unknown>>(
          `${config.baseUrl}/v1/customers/${payerId}/cards/${cardId}`,
          { method: 'GET', headers },
        );
        cardLastFour = (card.last_four_digits as string) || null;
      } catch {
        // Card details not available — try from last authorized payment
        try {
          const searchResult = await mpFetch<Record<string, unknown>>(
            `${config.baseUrl}/authorized_payments/search?preapproval_id=${mpPreapprovalId}&sort=date_created&criteria=desc&limit=1`,
            { method: 'GET', headers },
          );
          const results = searchResult.results as Record<string, unknown>[] | undefined;
          if (results?.[0]) {
            const card = results[0].card as Record<string, unknown> | undefined;
            cardLastFour = (card?.last_four_digits as string) || null;
          }
        } catch {
          // No card details available
        }
      }
    }

    return new Response(
      JSON.stringify({
        nextPaymentDate,
        paymentMethodId,
        cardLastFour,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('mp-get-subscription-status error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener estado de suscripción' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
