-- Schedule daily in-app expiration notifications
-- Runs at 08:05 UTC (05:05 Argentina), 5 minutes after the email digest,
-- to create in-app notifications for expiring/expired documents.
SELECT cron.schedule(
  'cron-expiration-notifications-daily',
  '5 8 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/cron-expiration-notifications',
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
