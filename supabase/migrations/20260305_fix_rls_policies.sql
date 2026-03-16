-- ============================================================================
-- Migration: Fix RLS Security Issues
-- Date: 2026-03-05
-- Description:
--   1. Fix notifications & audit_logs INSERT policies (TO service_role)
--   2. Add TO authenticated to all user-facing policies on entity tables
--   3. Add missing storage UPDATE policy
--   4. Make storage buckets private
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CRITICAL: Fix notifications & audit_logs INSERT policies (TO service_role)
-- ============================================================================

DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert audit_logs" ON audit_logs;
CREATE POLICY "Service role can insert audit_logs"
  ON audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================================
-- 2. Add TO authenticated to ALL user-facing policies
-- ============================================================================

-- --------------------------------------------------------------------------
-- 2a. companies (uses direct user_id comparison)
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view their own company" ON companies;
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own company" ON companies;
CREATE POLICY "Users can insert their own company"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own company" ON companies;
CREATE POLICY "Users can update their own company"
  ON companies FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own company" ON companies;
CREATE POLICY "Users can delete their own company"
  ON companies FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- 2b. fire_extinguishers
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view their company's fire extinguishers" ON fire_extinguishers;
CREATE POLICY "Users can view their company's fire extinguishers"
  ON fire_extinguishers FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can insert fire extinguishers for their company" ON fire_extinguishers;
CREATE POLICY "Users can insert fire extinguishers for their company"
  ON fire_extinguishers FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can update their company's fire extinguishers" ON fire_extinguishers;
CREATE POLICY "Users can update their company's fire extinguishers"
  ON fire_extinguishers FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can delete their company's fire extinguishers" ON fire_extinguishers;
CREATE POLICY "Users can delete their company's fire extinguishers"
  ON fire_extinguishers FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- --------------------------------------------------------------------------
-- 2c. self_protection_systems
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view self_protection_systems of their company" ON self_protection_systems;
CREATE POLICY "Users can view self_protection_systems of their company"
  ON self_protection_systems FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can insert self_protection_systems for their company" ON self_protection_systems;
CREATE POLICY "Users can insert self_protection_systems for their company"
  ON self_protection_systems FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can update self_protection_systems of their company" ON self_protection_systems;
CREATE POLICY "Users can update self_protection_systems of their company"
  ON self_protection_systems FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can delete self_protection_systems of their company" ON self_protection_systems;
CREATE POLICY "Users can delete self_protection_systems of their company"
  ON self_protection_systems FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- --------------------------------------------------------------------------
-- 2d. employees
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view employees of their company" ON employees;
CREATE POLICY "Users can view employees of their company"
  ON employees FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can insert employees for their company" ON employees;
CREATE POLICY "Users can insert employees for their company"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can update employees of their company" ON employees;
CREATE POLICY "Users can update employees of their company"
  ON employees FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can delete employees of their company" ON employees;
CREATE POLICY "Users can delete employees of their company"
  ON employees FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- --------------------------------------------------------------------------
-- 2e. conservation_certificates
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view certificates of their company" ON conservation_certificates;
CREATE POLICY "Users can view certificates of their company"
  ON conservation_certificates FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can insert certificates for their company" ON conservation_certificates;
CREATE POLICY "Users can insert certificates for their company"
  ON conservation_certificates FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can update certificates of their company" ON conservation_certificates;
CREATE POLICY "Users can update certificates of their company"
  ON conservation_certificates FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can delete certificates of their company" ON conservation_certificates;
CREATE POLICY "Users can delete certificates of their company"
  ON conservation_certificates FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- --------------------------------------------------------------------------
-- 2f. events
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view events of their company" ON events;
CREATE POLICY "Users can view events of their company"
  ON events FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can insert events for their company" ON events;
CREATE POLICY "Users can insert events for their company"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can update events of their company" ON events;
CREATE POLICY "Users can update events of their company"
  ON events FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can delete events of their company" ON events;
CREATE POLICY "Users can delete events of their company"
  ON events FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- --------------------------------------------------------------------------
-- 2g. qr_documents
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view qr_documents of their company" ON qr_documents;
CREATE POLICY "Users can view qr_documents of their company"
  ON qr_documents FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can insert qr_documents for their company" ON qr_documents;
CREATE POLICY "Users can insert qr_documents for their company"
  ON qr_documents FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can update qr_documents of their company" ON qr_documents;
CREATE POLICY "Users can update qr_documents of their company"
  ON qr_documents FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can delete qr_documents of their company" ON qr_documents;
CREATE POLICY "Users can delete qr_documents of their company"
  ON qr_documents FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- --------------------------------------------------------------------------
-- 2h. notifications (user-facing policies only)
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view notifications of their company" ON notifications;
CREATE POLICY "Users can view notifications of their company"
  ON notifications FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can update notifications of their company" ON notifications;
CREATE POLICY "Users can update notifications of their company"
  ON notifications FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can delete notifications of their company" ON notifications;
CREATE POLICY "Users can delete notifications of their company"
  ON notifications FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- --------------------------------------------------------------------------
-- 2i. audit_logs (user-facing SELECT only)
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view audit_logs of their company" ON audit_logs;
CREATE POLICY "Users can view audit_logs of their company"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- --------------------------------------------------------------------------
-- 2j. subscriptions (user-facing policies only)
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own company subscriptions" ON subscriptions;
CREATE POLICY "Users can view own company subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Users can insert subscriptions for own company" ON subscriptions;
CREATE POLICY "Users can insert subscriptions for own company"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- --------------------------------------------------------------------------
-- 2k. payment_transactions (user-facing SELECT only)
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own company transactions" ON payment_transactions;
CREATE POLICY "Users can view own company transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- ============================================================================
-- 3. Add missing storage UPDATE policy
-- ============================================================================

CREATE POLICY "Users can update their company files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('certificates', 'self-protection-systems', 'qr-documents')
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM companies WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. Make storage buckets private
-- ============================================================================

UPDATE storage.buckets
SET public = false
WHERE id IN ('certificates', 'qr-documents', 'self-protection-systems');

COMMIT;
