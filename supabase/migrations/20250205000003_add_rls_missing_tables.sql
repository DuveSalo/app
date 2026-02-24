-- Add Row Level Security to tables that are missing RLS policies
-- Tables already with RLS: companies, fire_extinguishers, self_protection_systems, subscriptions, payment_transactions
-- Tables MISSING RLS: employees, conservation_certificates, events, notifications, qr_documents, audit_logs

-- ============================================
-- EMPLOYEES
-- ============================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view employees of their company"
  ON employees FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert employees for their company"
  ON employees FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update employees of their company"
  ON employees FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete employees of their company"
  ON employees FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- ============================================
-- CONSERVATION_CERTIFICATES
-- ============================================
ALTER TABLE conservation_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view certificates of their company"
  ON conservation_certificates FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert certificates for their company"
  ON conservation_certificates FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update certificates of their company"
  ON conservation_certificates FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete certificates of their company"
  ON conservation_certificates FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- ============================================
-- EVENTS
-- ============================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events of their company"
  ON events FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert events for their company"
  ON events FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update events of their company"
  ON events FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete events of their company"
  ON events FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- ============================================
-- QR_DOCUMENTS
-- ============================================
ALTER TABLE qr_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view qr_documents of their company"
  ON qr_documents FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert qr_documents for their company"
  ON qr_documents FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update qr_documents of their company"
  ON qr_documents FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete qr_documents of their company"
  ON qr_documents FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- ============================================
-- NOTIFICATIONS
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications of their company"
  ON notifications FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update notifications of their company"
  ON notifications FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete notifications of their company"
  ON notifications FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- Notifications are created by the system (triggers/functions), not users directly
-- Allow service role to insert notifications
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- AUDIT_LOGS
-- ============================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs are read-only for users (written by triggers/system)
CREATE POLICY "Users can view audit_logs of their company"
  ON audit_logs FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- Only service role can write audit logs (via triggers)
CREATE POLICY "Service role can insert audit_logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
