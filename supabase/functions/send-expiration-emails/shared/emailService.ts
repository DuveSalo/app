/**
 * Email Service
 * Servicio para enviar emails usando adaptadores
 */

import { ExpiringService, EmailResponse } from './types.ts';
import { getEmailSubject, generateEmailHTML } from '../../../src/lib/utils/emailUtils.ts';
import { createEmailAdapter } from './emailAdapter.ts';

const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "notificaciones@tudominio.com";
const APP_URL = Deno.env.get("APP_URL");

// Crear adaptador una vez al inicio
const emailAdapter = createEmailAdapter();

console.log(`Email Service inicializado con: ${emailAdapter.getProviderName()}`);

/**
 * Envía un email de notificación usando el adaptador configurado
 */
export async function sendEmail(service: ExpiringService): Promise<EmailResponse> {
  if (!emailAdapter.isConfigured()) {
    console.error("Email adapter no está configurado");
    return {
      success: false,
      error: "Email adapter no configurado"
    };
  }

  const subject = getEmailSubject(service);
  const html = generateEmailHTML(service, APP_URL);

  try {
    const result = await emailAdapter.sendEmail({
      from: SENDER_EMAIL,
      to: service.userEmail,
      subject,
      html,
    });

    if (result.success) {
      console.log(`Email enviado exitosamente a ${service.userEmail} para ${service.name}`);
    }

    return result;
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
