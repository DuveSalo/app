-- ============================================================================
-- Admin Panel: manual_payments, activity_logs, companies columns, RLS, storage
-- ============================================================================

-- 1. Add payment method columns to companies
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'mercadopago'
    CHECK (payment_method IN ('mercadopago', 'bank_transfer')),
  ADD COLUMN IF NOT EXISTS bank_transfer_status text
    CHECK (bank_transfer_status IS NULL OR bank_transfer_status IN ('pending', 'active', 'suspended'));

-- 2. Create manual_payments table
CREATE TABLE IF NOT EXISTS manual_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  period_start date NOT NULL,
  period_end date NOT NULL,
  receipt_url text,
  receipt_uploaded_at timestamptz,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_period CHECK (period_end > period_start)
);

-- 3. Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_manual_payments_company_id ON manual_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_manual_payments_status ON manual_payments(status);
CREATE INDEX IF NOT EXISTS idx_manual_payments_created_at ON manual_payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_payment_method ON companies(payment_method);

-- 5. Updated_at trigger for manual_payments
CREATE OR REPLACE FUNCTION update_manual_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_manual_payments_updated_at ON manual_payments;
CREATE TRIGGER trg_manual_payments_updated_at
  BEFORE UPDATE ON manual_payments
  FOR EACH ROW EXECUTE FUNCTION update_manual_payments_updated_at();

-- 6. Enable RLS
ALTER TABLE manual_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 7. Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 8. RLS Policies for manual_payments

-- Admins can do everything
CREATE POLICY admin_all_manual_payments ON manual_payments
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Company owners can view their own payments
CREATE POLICY company_select_manual_payments ON manual_payments
  FOR SELECT TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Company owners can insert their own payments
CREATE POLICY company_insert_manual_payments ON manual_payments
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- 9. RLS Policies for activity_logs

-- Only admins can read activity logs
CREATE POLICY admin_select_activity_logs ON activity_logs
  FOR SELECT TO authenticated
  USING (is_admin());

-- Only service_role or admin can insert activity logs
CREATE POLICY admin_insert_activity_logs ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY service_insert_activity_logs ON activity_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 10. Admin read policy for companies (admins can read all companies)
CREATE POLICY admin_select_companies ON companies
  FOR SELECT TO authenticated
  USING (is_admin());

-- Admin update policy for companies
CREATE POLICY admin_update_companies ON companies
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admin delete policy for companies
CREATE POLICY admin_delete_companies ON companies
  FOR DELETE TO authenticated
  USING (is_admin());

-- 11. Private storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for receipts bucket
CREATE POLICY receipts_admin_all ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'receipts' AND is_admin())
  WITH CHECK (bucket_id = 'receipts' AND is_admin());

CREATE POLICY receipts_owner_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY receipts_owner_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM companies WHERE user_id = auth.uid()
    )
  );

-- 12. Grant permissions
GRANT SELECT, INSERT, UPDATE ON manual_payments TO authenticated;
GRANT SELECT, INSERT ON activity_logs TO authenticated;
GRANT ALL ON manual_payments TO service_role;
GRANT ALL ON activity_logs TO service_role;
