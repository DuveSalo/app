/**
 * Shared Resend email client for Edge Functions.
 * Uses Resend HTTP API directly (no SDK needed in Deno).
 *
 * Requires RESEND_API_KEY in Supabase secrets.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Sender address. In production, set RESEND_FROM_EMAIL to a verified custom domain
 * (e.g. "Escuela Segura <noreply@escuelasegura.com>").
 * The default onboarding@resend.dev is a Resend test domain that ONLY delivers
 * to the Resend account owner's email — all other recipients are silently dropped.
 */
function getDefaultFrom(): string {
  return Deno.env.get('RESEND_FROM_EMAIL') || 'Escuela Segura <onboarding@resend.dev>';
}

export class ResendError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly resendId?: string,
  ) {
    super(message);
    this.name = 'ResendError';
  }
}

export interface ResendEmailTag {
  name: string;
  value: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
  tags?: ResendEmailTag[];
  idempotencyKey?: string;
}

interface ResendResponse {
  id: string;
}

/**
 * Send an email via Resend HTTP API.
 * Returns the Resend message ID on success.
 */
export async function sendEmail(options: SendEmailOptions): Promise<string> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    throw new ResendError(500, 'RESEND_API_KEY is not configured');
  }

  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  if (recipients.length === 0 || recipients.some((recipient) => !recipient.trim())) {
    throw new ResendError(400, 'At least one recipient email is required');
  }

  const body = {
    from: options.from || getDefaultFrom(),
    to: recipients,
    subject: options.subject,
    html: options.html,
    ...(options.text !== undefined ? { text: options.text } : {}),
    ...(options.replyTo ? { reply_to: options.replyTo } : {}),
    ...(options.tags?.length ? { tags: options.tags } : {}),
  };

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  if (options.idempotencyKey?.trim()) {
    headers['Idempotency-Key'] = options.idempotencyKey.trim().slice(0, 256);
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ResendError(
      response.status,
      error.message || `Resend API error: HTTP ${response.status}`,
    );
  }

  const data: ResendResponse = await response.json();
  return data.id;
}

/**
 * Fire-and-forget email wrapper. Logs errors but never throws.
 * Use this in webhooks and activation flows where email failure
 * should NOT block the main operation.
 */
export async function sendEmailSafe(options: SendEmailOptions): Promise<void> {
  try {
    const id = await sendEmail(options);
    console.log(`Email sent: ${options.subject} → ${options.to} (id: ${id})`);
  } catch (error) {
    console.error(
      `Failed to send email: ${options.subject} → ${options.to}`,
      error instanceof ResendError ? `HTTP ${error.statusCode}: ${error.message}` : error,
    );
  }
}
