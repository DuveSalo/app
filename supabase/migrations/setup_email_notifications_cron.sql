-- =====================================================
-- Configuración de Cron Job para Envío de Emails
-- =====================================================
-- Este archivo configura un cron job que ejecuta la Edge Function
-- de envío de emails diariamente a las 8:00 AM
-- =====================================================

-- Instalar la extensión pg_cron si no está disponible
-- Nota: En Supabase, pg_cron solo está disponible en planes Pro y superiores
-- Si no está disponible, deberás usar otras alternativas como:
-- 1. GitHub Actions con scheduled workflows
-- 2. Servicios externos como Cron-job.org
-- 3. Supabase Edge Functions con servicios externos de scheduling

-- Verificar si pg_cron está disponible
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_available_extensions
        WHERE name = 'pg_cron'
    ) THEN
        CREATE EXTENSION IF NOT EXISTS pg_cron;

        -- Programar la ejecución diaria de la función
        -- Ejecuta todos los días a las 8:00 AM (hora del servidor)
        PERFORM cron.schedule(
            'send-expiration-emails-daily',
            '0 8 * * *',
            $$
            SELECT
              net.http_post(
                url := '<TU_SUPABASE_PROJECT_URL>/functions/v1/send-expiration-emails',
                headers := jsonb_build_object(
                  'Content-Type', 'application/json',
                  'Authorization', 'Bearer <TU_FUNCTION_SECRET>'
                ),
                body := '{}'::jsonb
              ) as request_id;
            $$
        );

        RAISE NOTICE 'Cron job configurado exitosamente';
    ELSE
        RAISE NOTICE 'pg_cron no está disponible en este plan de Supabase';
        RAISE NOTICE 'Por favor, configura el envío de emails usando GitHub Actions o un servicio externo';
    END IF;
END $$;

-- =====================================================
-- Función auxiliar para ejecutar manualmente el envío
-- =====================================================
-- Puedes ejecutar esto manualmente para probar el sistema:
-- SELECT trigger_email_notifications();

CREATE OR REPLACE FUNCTION trigger_email_notifications()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response jsonb;
BEGIN
  -- Llamar a la Edge Function
  SELECT net.http_post(
    url := '<TU_SUPABASE_PROJECT_URL>/functions/v1/send-expiration-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <TU_FUNCTION_SECRET>'
    ),
    body := '{}'::jsonb
  ) INTO response;

  RETURN response;
END;
$$;

-- =====================================================
-- Comentarios y permisos
-- =====================================================

COMMENT ON FUNCTION trigger_email_notifications() IS
'Función para ejecutar manualmente el envío de emails de notificación de vencimientos';

-- Nota: Recuerda reemplazar:
-- <TU_SUPABASE_PROJECT_URL> con tu URL de proyecto
-- <TU_FUNCTION_SECRET> con tu secret key para las funciones
