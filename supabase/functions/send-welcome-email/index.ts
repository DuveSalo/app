/**
 * Edge Function: send-welcome-email
 * Sends the onboarding welcome email after a company workspace is created.
 *
 * Security:
 * 1. Validates the caller JWT
 * 2. Verifies the authenticated user owns the company
 * 3. Sends email through the shared Resend client without exposing secrets to the browser
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { sendEmailSafe } from '../_shared/resend.ts';
import { welcomeEmail } from '../_shared/email-templates.ts';

interface WelcomeEmailRequest {
  companyId?: unknown;
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Missing authorization header' }, 401, cors);
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
      console.error('[send-welcome-email] JWT validation failed:', authError?.message);
      return jsonResponse({ error: authError?.message || 'Unauthorized' }, 401, cors);
    }

    const body = (await req.json().catch(() => ({}))) as WelcomeEmailRequest;
    const companyId = readString(body.companyId);

    if (!companyId) {
      return jsonResponse({ error: 'Missing companyId' }, 400, cors);
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .eq('user_id', user.id)
      .single();

    if (companyError || !company) {
      console.error('[send-welcome-email] Company ownership check failed:', {
        companyId,
        userId: user.id,
        error: companyError?.message,
      });
      return jsonResponse({ error: 'Company not found or access denied' }, 403, cors);
    }

    if (!user.email) {
      return jsonResponse({ error: 'Authenticated user has no email' }, 400, cors);
    }

    const metadata = user.user_metadata as Record<string, unknown> | null;
    const userName =
      readString(metadata?.name) || readString(metadata?.full_name) || user.email.split('@')[0];
    const appBaseUrl = Deno.env.get('APP_URL') || 'https://escuelasegura.com';
    const appUrl = `${appBaseUrl.replace(/\/$/, '')}/app`;

    await sendEmailSafe({
      to: user.email,
      subject: 'Bienvenido a Escuela Segura',
      html: welcomeEmail(userName, company.name, appUrl),
      idempotencyKey: `welcome-${user.id}-${company.id}`,
      tags: [
        { name: 'event', value: 'welcome' },
        { name: 'source', value: 'send-welcome-email' },
      ],
    });

    return jsonResponse({ success: true }, 200, cors);
  } catch (error) {
    console.error('[send-welcome-email] Unexpected error:', error);
    return jsonResponse({ error: 'Error al enviar bienvenida' }, 500, cors);
  }
});
