// supabase/functions/create-subscription/index.ts
// REST NOTE: This endpoint acts as POST /subscriptions (resource creation).
// The folder name uses a verb ("create-subscription") due to Supabase Edge Function naming.
// For a future API gateway migration, map to: POST /api/v1/subscriptions
// Based on: https://github.com/goncy/next-mercadopago/tree/main/integraciones/suscripciones
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:3000';

const corsHeaders = {
  'Access-Control-Allow-Origin': APP_URL,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-API-Version': '1',
};

interface CreateSubscriptionRequest {
  planId: string;
  planName: string;
  amount: number;
  payerEmail: string;
}

const VALID_PLAN_IDS = ['basic', 'standard', 'premium'];
const PLAN_PRICES: Record<string, number> = {
  basic: 29000,
  standard: 59000,
  premium: 99000,
};
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  }), { status, headers: corsHeaders });
}

function validateSubscriptionRequest(body: CreateSubscriptionRequest): string | null {
  if (!body.planId || !body.amount || !body.payerEmail) {
    const missing = [
      !body.planId && 'planId',
      !body.amount && 'amount',
      !body.payerEmail && 'payerEmail',
    ].filter(Boolean).join(', ');
    return `Campos requeridos faltantes: ${missing}`;
  }

  if (!VALID_PLAN_IDS.includes(body.planId)) {
    return `Plan invalido: ${body.planId}. Planes validos: ${VALID_PLAN_IDS.join(', ')}`;
  }

  if (typeof body.amount !== 'number' || !Number.isFinite(body.amount) || body.amount <= 0) {
    return 'El monto debe ser un numero positivo';
  }

  if (typeof body.payerEmail !== 'string' || !EMAIL_REGEX.test(body.payerEmail)) {
    return 'El email del pagador no tiene un formato valido';
  }

  return null;
}

function sanitizeString(input: string): string {
  return input.replace(/[<>"'&]/g, '').trim();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('Missing environment variables');
      return errorResponse(500, 'CONFIG_ERROR', 'Configuracion del servidor incompleta');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse(401, 'UNAUTHORIZED', 'No autorizado');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return errorResponse(401, 'UNAUTHORIZED', 'No autorizado');
    }

    // Get user's company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('user_id', user.id)
      .single();

    if (companyError || !company) {
      return errorResponse(404, 'NOT_FOUND', 'Empresa no encontrada');
    }

    const body: CreateSubscriptionRequest = await req.json();

    // Validate request fields
    const validationError = validateSubscriptionRequest(body);
    if (validationError) {
      return errorResponse(400, 'VALIDATION_ERROR', validationError);
    }

    // Sanitize string inputs
    body.planId = sanitizeString(body.planId);
    body.planName = sanitizeString(body.planName || body.planId);
    body.payerEmail = body.payerEmail.trim().toLowerCase();

    // Idempotency check: prevent duplicate active/pending subscriptions
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id, mp_preapproval_id, status')
      .eq('company_id', company.id)
      .in('status', ['pending', 'authorized'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingSub) {
      console.log('[create-subscription] Existing active subscription found:', existingSub.id);
      return errorResponse(409, 'CONFLICT', 'Ya existe una suscripcion activa o pendiente', {
        subscription_id: existingSub.mp_preapproval_id,
        status: existingSub.status,
      });
    }

    // Use server-side price — never trust client-sent amount
    const serverAmount = PLAN_PRICES[body.planId];
    if (!serverAmount) {
      return errorResponse(400, 'INVALID_PLAN', `Plan invalido: ${body.planId}`);
    }

    if (body.amount !== serverAmount) {
      console.warn(`[create-subscription] Amount mismatch: client=${body.amount}, server=${serverAmount}, plan=${body.planId}`);
    }

    // Build preapproval request body - Using PENDING status
    // User will be redirected to MercadoPago to complete payment
    const preapprovalBody = {
      reason: `SafetyGuard Pro - Plan ${body.planName}`,
      external_reference: company.id,
      payer_email: body.payerEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: serverAmount,
        currency_id: 'ARS',
      },
      back_url: `${APP_URL}/#/subscription/callback`,
      status: 'pending',
    };

    console.log('[create-subscription] Request to MP:', JSON.stringify(preapprovalBody, null, 2));

    // Create preapproval (subscription) in Mercado Pago via fetch
    console.log('[create-subscription] Using token:', MP_ACCESS_TOKEN.substring(0, 10) + '...');

    const preapprovalResponse = await fetch(
      'https://api.mercadopago.com/preapproval',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preapprovalBody),
      }
    );

    const preapproval = await preapprovalResponse.json();

    console.log('[create-subscription] MP Response:', JSON.stringify(preapproval, null, 2));

    if (!preapprovalResponse.ok) {
      console.error('Mercado Pago Error:', preapproval);

      let errorMessage = 'Error al crear la suscripcion';
      if (preapproval.message) {
        errorMessage = preapproval.message;
      }
      if (preapproval.cause && Array.isArray(preapproval.cause)) {
        const causes = preapproval.cause.map((c: { code?: string; description?: string }) =>
          c.description || c.code
        ).join(', ');
        errorMessage = `Error: ${causes}`;
      }

      return errorResponse(400, 'MP_ERROR', errorMessage, {
        mp_status: preapprovalResponse.status,
        mp_response: preapproval,
      });
    }

    // Save subscription to database with pending status (UPSERT for idempotency)
    const { data: subscription, error: dbError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          company_id: company.id,
          mp_preapproval_id: preapproval.id,
          mp_payer_id: preapproval.payer_id?.toString(),
          plan_id: body.planId,
          plan_name: body.planName,
          amount: serverAmount,
          status: 'pending', // Will be updated to 'authorized' via webhook
          start_date: preapproval.date_created,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'mp_preapproval_id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      // Continue even if DB insert fails - the MP subscription is created
    }

    // Return the init_point URL for redirect (201 Created per REST conventions)
    return new Response(JSON.stringify({
      success: true,
      init_point: preapproval.init_point, // URL to redirect user to MercadoPago
      subscription_id: preapproval.id,
      status: preapproval.status,
    }), {
      status: 201,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, 'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Error interno del servidor'
    );
  }
});
