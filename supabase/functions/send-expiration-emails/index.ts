/**
 * Send Expiration Emails Edge Function
 * Envía notificaciones por email y crea notificaciones in-app para servicios próximos a vencer
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Importar servicios y utilidades
import { getExpiringCertificates } from './shared/certificateService.ts';
import { getUpcomingInspections } from './shared/inspectionService.ts';
import { sendBulkEmails } from './shared/emailService.ts';
import { validateAuth, createServiceClient } from './shared/authUtils.ts';
import { FunctionResponse, ExpiringService } from './shared/types.ts';

/**
 * Crea notificaciones in-app para los servicios próximos a vencer
 */
async function createInAppNotifications(
  supabase: any,
  services: ExpiringService[]
): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  for (const service of services) {
    // Determinar tipo de notificación según urgencia
    let notificationType: string;
    if (service.daysUntilExpiration <= 7) {
      notificationType = 'expiration_urgent';
    } else {
      notificationType = 'expiration_warning';
    }

    const category = service.type === 'certificate' ? 'certificate' : 'inspection';
    const relatedTable = service.type === 'certificate'
      ? 'conservation_certificates'
      : 'self_protection_systems';

    // Verificar si ya existe una notificación reciente (últimas 24 horas)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: existingNotification } = await supabase
      .from('notifications')
      .select('id')
      .eq('related_table', relatedTable)
      .eq('related_id', service.id)
      .eq('type', notificationType)
      .gte('created_at', oneDayAgo.toISOString())
      .single();

    if (existingNotification) {
      console.log(`Notificación ya existe para ${service.name}, saltando...`);
      skipped++;
      continue;
    }

    // Crear la notificación
    const title = service.daysUntilExpiration <= 7
      ? `⚠️ Vencimiento urgente: ${service.daysUntilExpiration} días`
      : `Próximo a vencer: ${service.daysUntilExpiration} días`;

    const message = `${service.name} de ${service.companyName} vence el ${new Date(service.expirationDate).toLocaleDateString('es-AR')}.`;

    const link = service.type === 'certificate'
      ? '/conservation-certificates'
      : '/self-protection-systems';

    const { error } = await supabase
      .from('notifications')
      .insert({
        company_id: service.companyId,
        type: notificationType,
        category: category,
        title: title,
        message: message,
        link: link,
        related_table: relatedTable,
        related_id: service.id,
        is_read: false
      });

    if (error) {
      console.error(`Error creando notificación para ${service.name}:`, error);
    } else {
      console.log(`Notificación in-app creada para ${service.name}`);
      created++;
    }
  }

  return { created, skipped };
}

/**
 * Handler principal de la Edge Function
 */
Deno.serve(async (req: Request): Promise<Response> => {
  try {
    // 1. Validar autenticación
    const authValidation = validateAuth(req);
    if (!authValidation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No autorizado"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 2. Crear cliente de Supabase
    const supabase = await createServiceClient();

    // 3. Obtener servicios próximos a vencer en paralelo
    console.log("Buscando servicios próximos a vencer...");
    const [certificates, inspections] = await Promise.all([
      getExpiringCertificates(supabase),
      getUpcomingInspections(supabase),
    ]);

    const allServices = [...certificates, ...inspections];
    console.log(`Encontrados ${allServices.length} servicios próximos a vencer`);
    console.log(`- Certificados: ${certificates.length}`);
    console.log(`- Inspecciones: ${inspections.length}`);

    // 4. Enviar emails y crear notificaciones in-app si hay servicios
    let emailSuccessCount = 0;
    let emailFailureCount = 0;
    let notificationsCreated = 0;
    let notificationsSkipped = 0;

    if (allServices.length > 0) {
      // Enviar emails
      console.log("Enviando notificaciones por email...");
      const emailResults = await sendBulkEmails(allServices);
      emailSuccessCount = emailResults.successCount;
      emailFailureCount = emailResults.failureCount;

      console.log(`Emails enviados: ${emailSuccessCount}`);
      console.log(`Emails fallidos: ${emailFailureCount}`);

      // Crear notificaciones in-app
      console.log("Creando notificaciones in-app...");
      const notificationResults = await createInAppNotifications(supabase, allServices);
      notificationsCreated = notificationResults.created;
      notificationsSkipped = notificationResults.skipped;

      console.log(`Notificaciones creadas: ${notificationsCreated}`);
      console.log(`Notificaciones saltadas (duplicadas): ${notificationsSkipped}`);
    } else {
      console.log("No hay servicios próximos a vencer");
    }

    // 5. Retornar respuesta exitosa
    const response: FunctionResponse = {
      success: true,
      message: "Procesamiento completado",
      stats: {
        totalServices: allServices.length,
        certificates: certificates.length,
        inspections: inspections.length,
        emailsSent: emailSuccessCount,
        emailsFailed: emailFailureCount,
      },
    };

    // Agregar stats de notificaciones
    (response as any).notificationStats = {
      created: notificationsCreated,
      skipped: notificationsSkipped
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    // Manejo de errores centralizado
    console.error("Error en la función:", error);

    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    const response: FunctionResponse = {
      success: false,
      error: errorMessage,
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
