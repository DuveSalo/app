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

-- RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company transactions"
  ON payment_transactions FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Service role can insert/update (for webhooks and edge functions)
CREATE POLICY "Service role can manage transactions"
  ON payment_transactions FOR ALL
  USING (true)
  WITH CHECK (true);
