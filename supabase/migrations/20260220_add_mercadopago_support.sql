-- Migration: Add MercadoPago subscription support (dual-provider)
-- Date: 2026-02-20

-- 1. Add payment_provider and MercadoPago columns to subscriptions
ALTER TABLE subscriptions
  ADD COLUMN payment_provider TEXT NOT NULL DEFAULT 'paypal',
  ADD COLUMN mp_preapproval_id TEXT UNIQUE,
  ADD COLUMN mp_plan_id TEXT;

-- Payment provider constraint
ALTER TABLE subscriptions ADD CONSTRAINT chk_payment_provider
  CHECK (payment_provider IN ('paypal', 'mercadopago'));

-- Index for MercadoPago lookups
CREATE INDEX idx_subscriptions_mp_id ON subscriptions(mp_preapproval_id);
CREATE INDEX idx_subscriptions_provider ON subscriptions(payment_provider);


-- 2. Create MercadoPago webhook log table (service_role only)
CREATE TABLE mp_webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id TEXT UNIQUE NOT NULL,
  action TEXT NOT NULL,
  type TEXT NOT NULL,
  data_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processing_error TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mp_webhook_log_data_id ON mp_webhook_log(data_id);
CREATE INDEX idx_mp_webhook_log_unprocessed ON mp_webhook_log(processed)
  WHERE processed = FALSE;

-- Grants (service_role only)
GRANT ALL ON mp_webhook_log TO service_role;

-- RLS
ALTER TABLE mp_webhook_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on mp webhook log"
  ON mp_webhook_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- Reload schema cache
NOTIFY pgrst, 'reload schema';
