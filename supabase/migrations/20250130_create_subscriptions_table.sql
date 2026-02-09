-- Create subscriptions table for Mercado Pago integration
-- supabase/migrations/20250130_create_subscriptions_table.sql

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Mercado Pago IDs
  mp_preapproval_id TEXT UNIQUE,
  mp_payer_id TEXT,

  -- Plan info
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ARS',

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending, authorized, paused, cancelled, expired

  -- Dates
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE
);

-- Indexes (composite for common query pattern: company_id + status + created_at)
CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_mp_preapproval ON subscriptions(mp_preapproval_id);
CREATE INDEX idx_subscriptions_company_status_created ON subscriptions(company_id, status, created_at DESC);
CREATE INDEX idx_subscriptions_active ON subscriptions(company_id, created_at DESC) WHERE status IN ('pending', 'authorized', 'paused');

-- Status constraint
ALTER TABLE subscriptions ADD CONSTRAINT chk_subscription_status
  CHECK (status IN ('pending', 'authorized', 'paused', 'cancelled', 'expired'));

-- GRANTs (least privilege)
GRANT SELECT, INSERT ON subscriptions TO authenticated;
GRANT SELECT ON subscriptions TO anon;
GRANT ALL ON subscriptions TO service_role;

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- (select auth.uid()) wrapped for performance: evaluated once, not per row
CREATE POLICY "Users can view own company subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert subscriptions for own company"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = (select auth.uid())
    )
  );

-- Service role: full access (for webhooks and edge functions)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at (uses existing function from other migrations)
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
