-- Create subscriptions and payment_transactions tables
-- Safe to run multiple times (uses IF NOT EXISTS)

-- 1. Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  mp_preapproval_id TEXT UNIQUE,
  mp_payer_id TEXT,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ARS',
  status TEXT NOT NULL DEFAULT 'pending',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_preapproval ON subscriptions(mp_preapproval_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view own company subscriptions') THEN
    CREATE POLICY "Users can view own company subscriptions"
      ON subscriptions FOR SELECT
      USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can insert subscriptions for own company') THEN
    CREATE POLICY "Users can insert subscriptions for own company"
      ON subscriptions FOR INSERT
      WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Service role can update subscriptions') THEN
    CREATE POLICY "Service role can update subscriptions"
      ON subscriptions FOR UPDATE
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  mp_payment_id TEXT UNIQUE,
  mp_order_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ARS',
  status TEXT NOT NULL,
  status_detail TEXT,
  payment_method TEXT,
  payment_type TEXT,
  date_created TIMESTAMPTZ DEFAULT NOW(),
  date_approved TIMESTAMPTZ,
  mp_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_company ON payment_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_mp_payment ON payment_transactions(mp_payment_id);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Users can view own company transactions') THEN
    CREATE POLICY "Users can view own company transactions"
      ON payment_transactions FOR SELECT
      USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Service role can manage transactions') THEN
    CREATE POLICY "Service role can manage transactions"
      ON payment_transactions FOR ALL
      USING (true) WITH CHECK (true);
  END IF;
END $$;
