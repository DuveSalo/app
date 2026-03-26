-- ============================================================================
-- Migration: Add insert_notification RPC
-- Date: 2026-03-19
-- Description:
--   The notifications table INSERT policy is restricted to `service_role`
--   (see 20260305_fix_rls_policies.sql). The admin client (anon key +
--   authenticated role) cannot insert notifications directly from the browser.
--
--   This RPC runs with SECURITY DEFINER (as the function owner, which has
--   superuser-like access to bypass RLS) so that authenticated admin users
--   can insert notifications on behalf of a company without needing
--   service_role privileges in the client.
-- ============================================================================

CREATE OR REPLACE FUNCTION insert_notification(
  p_company_id   UUID,
  p_type         TEXT,
  p_category     TEXT,
  p_title        TEXT,
  p_message      TEXT,
  p_link         TEXT    DEFAULT NULL,
  p_related_table TEXT   DEFAULT NULL,
  p_related_id   TEXT    DEFAULT NULL,
  p_is_read      BOOLEAN DEFAULT false,
  p_user_id      UUID    DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (
    company_id,
    type,
    category,
    title,
    message,
    link,
    related_table,
    related_id,
    is_read,
    user_id
  )
  VALUES (
    p_company_id,
    p_type,
    p_category,
    p_title,
    p_message,
    p_link,
    p_related_table,
    p_related_id,
    p_is_read,
    p_user_id
  );
END;
$$;

-- Only authenticated users (admins) may call this function.
-- The is_admin() check inside payments.ts guards the outer action;
-- we grant to authenticated here so the RPC call itself is allowed.
GRANT EXECUTE ON FUNCTION insert_notification TO authenticated;
