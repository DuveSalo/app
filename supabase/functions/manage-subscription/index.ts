// supabase/functions/manage-subscription/index.ts
// REST NOTE: This endpoint manages existing subscriptions (cancel, pause, change_plan).
// Maps to: POST /api/v1/subscriptions/manage
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

type Action = 'cancel' | 'pause' | 'change_plan';

interface ManageSubscriptionRequest {
  action: Action;
  newPlanId?: string; // Required for change_plan
}

const VALID_ACTIONS: Action[] = ['cancel', 'pause', 'change_plan'];
const VALID_PLAN_IDS = ['basic', 'standard', 'premium'];
const PLAN_PRICES: Record<string, number> = {
  basic: 29000,
  standard: 59000,
  premium: 99000,
};
const PLAN_NAMES: Record<string, string> = {
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
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
  }), { status, headers: corsHeaders });
}

/**
 * Cancel or pause a subscription in MercadoPago API
 */
async function updateMPSubscriptionStatus(
  preapprovalId: string,
  newStatus: 'cancelled' | 'paused',
  accessToken: string
): Promise<{ ok: boolean; data?: Record<string, unknown>; error?: string }> {
  const response = await fetch(
    `https://api.mercadopago.com/preapproval/${preapprovalId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(`Failed to update MP subscription ${preapprovalId} to ${newStatus}:`, data);
    return {
      ok: false,
      error: data.message || `Error al ${newStatus === 'cancelled' ? 'cancelar' : 'pausar'} la suscripcion en MercadoPago`,
    };
  }

  return { ok: true, data };
}

/**
 * Create a new subscription in MercadoPago API
 */
async function createMPSubscription(
  planId: string,
  payerEmail: string,
  companyId: string,
  accessToken: string,
  appUrl: string
): Promise<{ ok: boolean; data?: Record<string, unknown>; error?: string }> {
  const serverAmount = PLAN_PRICES[planId];
  const planName = PLAN_NAMES[planId];

  const preapprovalBody = {
    reason: `SafetyGuard Pro - Plan ${planName}`,
    external_reference: companyId,
    payer_email: payerEmail,
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: serverAmount,
      currency_id: 'ARS',
    },
    back_url: `${appUrl}/#/subscription/callback`,
    status: 'pending',
  };

  const response = await fetch(
    'https://api.mercadopago.com/preapproval',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preapprovalBody),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error('Failed to create MP subscription:', data);
    return {
      ok: false,
      error: data.message || 'Error al crear la nueva suscripcion en MercadoPago',
    };
  }

  return { ok: true, data };
}

serve(async (req) => {
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
      .select('id, name, selected_plan')
      .eq('user_id', user.id)
      .single();

    if (companyError || !company) {
      return errorResponse(404, 'NOT_FOUND', 'Empresa no encontrada');
    }

    const body: ManageSubscriptionRequest = await req.json();

    // Validate action
    if (!body.action || !VALID_ACTIONS.includes(body.action)) {
      return errorResponse(400, 'VALIDATION_ERROR',
        `Accion invalida: ${body.action}. Acciones validas: ${VALID_ACTIONS.join(', ')}`
      );
    }

    // For change_plan, validate newPlanId
    if (body.action === 'change_plan') {
      if (!body.newPlanId || !VALID_PLAN_IDS.includes(body.newPlanId)) {
        return errorResponse(400, 'VALIDATION_ERROR',
          `Plan invalido: ${body.newPlanId}. Planes validos: ${VALID_PLAN_IDS.join(', ')}`
        );
      }
      if (body.newPlanId === company.selected_plan) {
        return errorResponse(400, 'VALIDATION_ERROR', 'El nuevo plan es igual al plan actual');
      }
    }

    // Find active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, mp_preapproval_id, status, plan_id')
      .eq('company_id', company.id)
      .in('status', ['pending', 'authorized'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError || !subscription) {
      return errorResponse(404, 'NOT_FOUND', 'No se encontro una suscripcion activa');
    }

    if (!subscription.mp_preapproval_id) {
      return errorResponse(400, 'INVALID_STATE', 'La suscripcion no tiene un ID de MercadoPago asociado');
    }

    // Handle CANCEL
    if (body.action === 'cancel') {
      const mpResult = await updateMPSubscriptionStatus(
        subscription.mp_preapproval_id, 'cancelled', MP_ACCESS_TOKEN
      );

      if (!mpResult.ok) {
        return errorResponse(400, 'MP_ERROR', mpResult.error!);
      }

      // Update database
      await Promise.all([
        supabase
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', subscription.id),
        supabase
          .from('companies')
          .update({ subscription_status: 'canceled', is_subscribed: false })
          .eq('id', company.id),
      ]);

      return new Response(JSON.stringify({
        success: true,
        message: 'Suscripcion cancelada correctamente',
        status: 'cancelled',
      }), { status: 200, headers: corsHeaders });
    }

    // Handle PAUSE
    if (body.action === 'pause') {
      const mpResult = await updateMPSubscriptionStatus(
        subscription.mp_preapproval_id, 'paused', MP_ACCESS_TOKEN
      );

      if (!mpResult.ok) {
        return errorResponse(400, 'MP_ERROR', mpResult.error!);
      }

      await Promise.all([
        supabase
          .from('subscriptions')
          .update({ status: 'paused', updated_at: new Date().toISOString() })
          .eq('id', subscription.id),
        supabase
          .from('companies')
          .update({ subscription_status: 'paused' })
          .eq('id', company.id),
      ]);

      return new Response(JSON.stringify({
        success: true,
        message: 'Suscripcion pausada correctamente',
        status: 'paused',
      }), { status: 200, headers: corsHeaders });
    }

    // Handle CHANGE_PLAN
    if (body.action === 'change_plan') {
      // Step 1: Cancel current subscription in MP
      const cancelResult = await updateMPSubscriptionStatus(
        subscription.mp_preapproval_id, 'cancelled', MP_ACCESS_TOKEN
      );

      if (!cancelResult.ok) {
        return errorResponse(400, 'MP_ERROR', cancelResult.error!);
      }

      // Step 2: Mark old subscription as cancelled in DB
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', subscription.id);

      // Step 3: Create new subscription in MP
      const createResult = await createMPSubscription(
        body.newPlanId!,
        user.email!,
        company.id,
        MP_ACCESS_TOKEN,
        APP_URL
      );

      if (!createResult.ok) {
        // Rollback: restore company state but old MP sub is already cancelled
        return errorResponse(400, 'MP_ERROR', createResult.error!);
      }

      const newPreapproval = createResult.data!;

      // Step 4: Save new subscription to DB
      await supabase
        .from('subscriptions')
        .insert({
          company_id: company.id,
          mp_preapproval_id: (newPreapproval as Record<string, unknown>).id as string,
          mp_payer_id: ((newPreapproval as Record<string, unknown>).payer_id || '').toString(),
          plan_id: body.newPlanId!,
          plan_name: PLAN_NAMES[body.newPlanId!],
          amount: PLAN_PRICES[body.newPlanId!],
          status: 'pending',
          start_date: (newPreapproval as Record<string, unknown>).date_created as string,
          updated_at: new Date().toISOString(),
        });

      // Step 5: Update company with new plan
      await supabase
        .from('companies')
        .update({
          selected_plan: body.newPlanId!,
          subscription_status: 'pending',
        })
        .eq('id', company.id);

      return new Response(JSON.stringify({
        success: true,
        message: 'Plan actualizado. Complete el pago del nuevo plan.',
        init_point: (newPreapproval as Record<string, unknown>).init_point,
        subscription_id: (newPreapproval as Record<string, unknown>).id,
        status: 'pending',
      }), { status: 201, headers: corsHeaders });
    }

    return errorResponse(400, 'INVALID_ACTION', 'Accion no reconocida');

  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, 'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Error interno del servidor'
    );
  }
});
