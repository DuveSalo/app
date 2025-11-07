/**
 * Email Service
 * Servicio para enviar emails usando Resend API
 */

import { ExpiringService, EmailResponse } from './types.ts';
import { getEmailSubject, generateEmailHTML } from '../../../src/lib/utils/emailUtils.ts';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "notificaciones@tudominio.com";
const APP_URL = Deno.env.get("APP_URL");

/**
 * Envía un email de notificación usando Resend
 */
export async function sendEmail(service: ExpiringService): Promise<EmailResponse> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY no está configurada");
    return {
      success: false,
      error: "RESEND_API_KEY no configurada"
    };
  }

  const subject = getEmailSubject(service);
  const html = generateEmailHTML(service, APP_URL);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: service.userEmail,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error enviando email a ${service.userEmail}:`, errorText);
      return {
        success: false,
        error: errorText
      };
    }

    const data = await response.json();
    console.log(`Email enviado exitosamente a ${service.userEmail} para ${service.name}`);

    return {
      success: true,
      emailId: data.id
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`Error enviando email a ${service.userEmail}:`, errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Envía múltiples emails en paralelo
 */
export async function sendBulkEmails(services: ExpiringService[]): Promise<{
  successCount: number;
  failureCount: number;
}> {
  const results = await Promise.all(
    services.map(service => sendEmail(service))
  );

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  return { successCount, failureCount };
}
