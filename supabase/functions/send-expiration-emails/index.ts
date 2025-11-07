/**
 * Send Expiration Emails Edge Function
 * Envía notificaciones por email para servicios próximos a vencer
 *
 * Refactorizado para mejor modularidad y mantenibilidad
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Importar servicios y utilidades
import { getExpiringCertificates } from './shared/certificateService.ts';
import { getUpcomingInspections } from './shared/inspectionService.ts';
import { sendBulkEmails } from './shared/emailService.ts';
import { validateAuth, createServiceClient } from './shared/authUtils.ts';
import { FunctionResponse } from './shared/types.ts';

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

    // 4. Enviar emails si hay servicios
    let successCount = 0;
    let failureCount = 0;

    if (allServices.length > 0) {
      console.log("Enviando notificaciones por email...");
      const results = await sendBulkEmails(allServices);
      successCount = results.successCount;
      failureCount = results.failureCount;

      console.log(`Emails enviados: ${successCount}`);
      console.log(`Emails fallidos: ${failureCount}`);
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
        emailsSent: successCount,
        emailsFailed: failureCount,
      },
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
