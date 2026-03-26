-- Fix activity_logs.admin_id FK to use ON DELETE SET NULL
-- This prevents FK violations when an admin deletes their own account.

ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_admin_id_fkey;

ALTER TABLE activity_logs
  ADD CONSTRAINT activity_logs_admin_id_fkey
  FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE SET NULL;
