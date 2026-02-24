-- Optimize RLS policies by wrapping auth.uid() in (SELECT ...)
-- This ensures auth.uid() is evaluated ONCE and cached, not per-row
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations

-- ============================================
-- COMPANIES - Direct user_id comparison
-- ============================================
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can insert their own company" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;
DROP POLICY IF EXISTS "Users can delete their own company" ON companies;

CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own company"
  ON companies FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own company"
  ON companies FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own company"
  ON companies FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- FIRE_EXTINGUISHERS
-- ============================================
DROP POLICY IF EXISTS "Users can view their company's fire extinguishers" ON fire_extinguishers;
DROP POLICY IF EXISTS "Users can insert fire extinguishers for their company" ON fire_extinguishers;
DROP POLICY IF EXISTS "Users can update their company's fire extinguishers" ON fire_extinguishers;
DROP POLICY IF EXISTS "Users can delete their company's fire extinguishers" ON fire_extinguishers;

CREATE POLICY "Users can view their company's fire extinguishers"
  ON fire_extinguishers FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert fire extinguishers for their company"
  ON fire_extinguishers FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update their company's fire extinguishers"
  ON fire_extinguishers FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete their company's fire extinguishers"
  ON fire_extinguishers FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- ============================================
-- SELF_PROTECTION_SYSTEMS
-- ============================================
DROP POLICY IF EXISTS "Users can view self_protection_systems of their company" ON self_protection_systems;
DROP POLICY IF EXISTS "Users can insert self_protection_systems for their company" ON self_protection_systems;
DROP POLICY IF EXISTS "Users can update self_protection_systems of their company" ON self_protection_systems;
DROP POLICY IF EXISTS "Users can delete self_protection_systems of their company" ON self_protection_systems;

CREATE POLICY "Users can view self_protection_systems of their company"
  ON self_protection_systems FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert self_protection_systems for their company"
  ON self_protection_systems FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update self_protection_systems of their company"
  ON self_protection_systems FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete self_protection_systems of their company"
  ON self_protection_systems FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- ============================================
-- EMPLOYEES
-- ============================================
DROP POLICY IF EXISTS "Users can view employees of their company" ON employees;
DROP POLICY IF EXISTS "Users can insert employees for their company" ON employees;
DROP POLICY IF EXISTS "Users can update employees of their company" ON employees;
DROP POLICY IF EXISTS "Users can delete employees of their company" ON employees;

CREATE POLICY "Users can view employees of their company"
  ON employees FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert employees for their company"
  ON employees FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update employees of their company"
  ON employees FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete employees of their company"
  ON employees FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- ============================================
-- CONSERVATION_CERTIFICATES
-- ============================================
DROP POLICY IF EXISTS "Users can view certificates of their company" ON conservation_certificates;
DROP POLICY IF EXISTS "Users can insert certificates for their company" ON conservation_certificates;
DROP POLICY IF EXISTS "Users can update certificates of their company" ON conservation_certificates;
DROP POLICY IF EXISTS "Users can delete certificates of their company" ON conservation_certificates;

CREATE POLICY "Users can view certificates of their company"
  ON conservation_certificates FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert certificates for their company"
  ON conservation_certificates FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update certificates of their company"
  ON conservation_certificates FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete certificates of their company"
  ON conservation_certificates FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- ============================================
-- EVENTS
-- ============================================
DROP POLICY IF EXISTS "Users can view events of their company" ON events;
DROP POLICY IF EXISTS "Users can insert events for their company" ON events;
DROP POLICY IF EXISTS "Users can update events of their company" ON events;
DROP POLICY IF EXISTS "Users can delete events of their company" ON events;

CREATE POLICY "Users can view events of their company"
  ON events FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert events for their company"
  ON events FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update events of their company"
  ON events FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete events of their company"
  ON events FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- ============================================
-- QR_DOCUMENTS
-- ============================================
DROP POLICY IF EXISTS "Users can view qr_documents of their company" ON qr_documents;
DROP POLICY IF EXISTS "Users can insert qr_documents for their company" ON qr_documents;
DROP POLICY IF EXISTS "Users can update qr_documents of their company" ON qr_documents;
DROP POLICY IF EXISTS "Users can delete qr_documents of their company" ON qr_documents;

CREATE POLICY "Users can view qr_documents of their company"
  ON qr_documents FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert qr_documents for their company"
  ON qr_documents FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update qr_documents of their company"
  ON qr_documents FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete qr_documents of their company"
  ON qr_documents FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- ============================================
-- NOTIFICATIONS
-- ============================================
DROP POLICY IF EXISTS "Users can view notifications of their company" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications of their company" ON notifications;
DROP POLICY IF EXISTS "Users can delete notifications of their company" ON notifications;

CREATE POLICY "Users can view notifications of their company"
  ON notifications FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can update notifications of their company"
  ON notifications FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can delete notifications of their company"
  ON notifications FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- ============================================
-- AUDIT_LOGS
-- ============================================
DROP POLICY IF EXISTS "Users can view audit_logs of their company" ON audit_logs;

CREATE POLICY "Users can view audit_logs of their company"
  ON audit_logs FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
DROP POLICY IF EXISTS "Users can view own company subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert subscriptions for own company" ON subscriptions;

CREATE POLICY "Users can view own company subscriptions"
  ON subscriptions FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Users can insert subscriptions for own company"
  ON subscriptions FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- ============================================
-- PAYMENT_TRANSACTIONS
-- ============================================
DROP POLICY IF EXISTS "Users can view own company transactions" ON payment_transactions;

CREATE POLICY "Users can view own company transactions"
  ON payment_transactions FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = (SELECT auth.uid())));

-- ============================================
-- ADD MISSING INDEX: notifications.company_id
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON notifications(company_id);
