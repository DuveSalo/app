-- Migration: Replace MercadoPago subscription tables with PayPal-compatible schema
-- Date: 2026-02-19

-- 1. Remove old CRON job (references deleted edge function)
SELECT cron.unschedule('check-subscriptions-daily');

-- 2. Drop old MercadoPago tables
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- 3. Create new subscriptions table (PayPal-compatible)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- PayPal IDs
  paypal_subscription_id TEXT UNIQUE,
  paypal_plan_id TEXT,

  -- Plan info (internal)
  plan_key TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',

  -- Subscriber
  subscriber_email TEXT,

  -- Period tracking
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_billing_time TIMESTAMPTZ,

  -- Lifecycle dates
  activated_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,

  -- Payment health
  failed_payments_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Status constraint
ALTER TABLE subscriptions ADD CONSTRAINT chk_subscription_status
  CHECK (status IN ('pending', 'approval_pending', 'active', 'suspended', 'cancelled', 'expired'));

-- Indexes
CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_paypal_id ON subscriptions(paypal_subscription_id);
CREATE INDEX idx_subscriptions_company_status ON subscriptions(company_id, status);
CREATE INDEX idx_subscriptions_active ON subscriptions(company_id)
  WHERE status = 'active';

-- Grants
GRANT SELECT, INSERT ON subscriptions TO authenticated;
GRANT ALL ON subscriptions TO service_role;

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert subscriptions for own company"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Service role full access on subscriptions"
  ON subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- updated_at trigger
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- 4. Create payment_transactions table
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- PayPal IDs
  paypal_transaction_id TEXT UNIQUE NOT NULL,

  -- Amounts
  gross_amount DECIMAL(12,2) NOT NULL,
  fee_amount DECIMAL(12,2),
  net_amount DECIMAL(12,2),
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Status
  status TEXT NOT NULL,

  -- Dates
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Status constraint
ALTER TABLE payment_transactions ADD CONSTRAINT chk_transaction_status
  CHECK (status IN ('completed', 'pending', 'refunded', 'failed'));

-- Indexes
CREATE INDEX idx_transactions_company ON payment_transactions(company_id);
CREATE INDEX idx_transactions_subscription ON payment_transactions(subscription_id);
CREATE INDEX idx_transactions_paypal_id ON payment_transactions(paypal_transaction_id);

-- Grants
GRANT SELECT ON payment_transactions TO authenticated;
GRANT ALL ON payment_transactions TO service_role;

-- RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Service role full access on transactions"
  ON payment_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- 5. Create webhook log table (service_role only)
CREATE TABLE paypal_webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processing_error TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhook_log_event_type ON paypal_webhook_log(event_type);
CREATE INDEX idx_webhook_log_resource ON paypal_webhook_log(resource_id);
CREATE INDEX idx_webhook_log_unprocessed ON paypal_webhook_log(processed)
  WHERE processed = FALSE;

-- Grants (service_role only)
GRANT ALL ON paypal_webhook_log TO service_role;

-- RLS
ALTER TABLE paypal_webhook_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on webhook log"
  ON paypal_webhook_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- 6. Schedule new CRON job for subscription health checks
SELECT cron.schedule(
  'check-subscriptions-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/cron-check-subscriptions',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
