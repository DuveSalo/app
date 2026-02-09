-- Enable required extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule: run daily at 03:00 UTC
-- Calls the cron-check-subscriptions Edge Function via pg_net
-- The CRON_SECRET is also stored in Supabase Edge Function secrets
SELECT cron.schedule(
  'check-subscriptions-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wmjafcqvgqnbxwxvhpui.supabase.co/functions/v1/cron-check-subscriptions',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ec28877cad2f0a5b7b08a6bf2874c70f33c3f4702bea88c77ec681ba48e4ed29"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
