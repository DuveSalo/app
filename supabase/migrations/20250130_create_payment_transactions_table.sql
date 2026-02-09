-- Create payment_transactions table for tracking individual payments
-- supabase/migrations/20250130_create_payment_transactions_table.sql

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Mercado Pago IDs
  mp_payment_id TEXT UNIQUE,
  mp_order_id TEXT,

  -- Transaction details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ARS',
  status TEXT NOT NULL,
  -- approved, pending, rejected, refunded

  status_detail TEXT,
  payment_method TEXT,
  payment_type TEXT,

  -- Dates
  date_created TIMESTAMPTZ DEFAULT NOW(),
  date_approved TIMESTAMPTZ,

  -- Raw response (for debugging)
  mp_response JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_company ON payment_transactions(company_id);
CREATE INDEX idx_transactions_subscription ON payment_transactions(subscription_id);
CREATE INDEX idx_transactions_mp_payment ON payment_transactions(mp_payment_id);

-- Status constraint
ALTER TABLE payment_transactions ADD CONSTRAINT chk_transaction_status
  CHECK (status IN ('approved', 'pending', 'rejected', 'refunded', 'cancelled'));

-- GRANTs (least privilege - users only read, service_role manages)
GRANT SELECT ON payment_transactions TO authenticated;
GRANT SELECT ON payment_transactions TO anon;
GRANT ALL ON payment_transactions TO service_role;

-- RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- (select auth.uid()) wrapped for performance: evaluated once, not per row
CREATE POLICY "Users can view own company transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = (select auth.uid())
    )
  );

-- Service role: full access (webhooks insert/update transactions)
CREATE POLICY "Service role can manage transactions"
  ON payment_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
