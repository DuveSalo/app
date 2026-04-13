-- Schedule daily expiration email digest
-- Runs at 08:00 UTC (05:00 Argentina) to send email digests
-- for documents expiring within 30 days or already expired.
SELECT cron.schedule(
  'send-expiration-emails-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-expiration-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(
        NULLIF(current_setting('app.settings.cron_secret', true), ''),
        current_setting('app.settings.service_role_key')
      )
    ),
    body := '{}'::jsonb
  );
  $$
);
