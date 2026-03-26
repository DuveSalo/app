-- Ensure admin-related references do not block auth.users deletion.
-- This complements the delete-account Edge Function cleanup and keeps
-- the schema consistent across environments.

ALTER TABLE IF EXISTS activity_logs
  ALTER COLUMN admin_id DROP NOT NULL;

ALTER TABLE IF EXISTS activity_logs
  DROP CONSTRAINT IF EXISTS activity_logs_admin_id_fkey;

ALTER TABLE IF EXISTS activity_logs
  ADD CONSTRAINT activity_logs_admin_id_fkey
  FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS manual_payments
  DROP CONSTRAINT IF EXISTS manual_payments_reviewed_by_fkey;

ALTER TABLE IF EXISTS manual_payments
  ADD CONSTRAINT manual_payments_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
