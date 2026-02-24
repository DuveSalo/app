-- Add provider consistency constraint
-- Ensures each subscription has the correct external ID for its provider
ALTER TABLE subscriptions ADD CONSTRAINT chk_provider_consistency CHECK (
  (payment_provider = 'paypal' AND paypal_subscription_id IS NOT NULL) OR
  (payment_provider = 'mercadopago' AND mp_preapproval_id IS NOT NULL) OR
  (payment_provider IS NULL)
);

-- Composite indexes for frequent Edge Function lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_provider
  ON subscriptions(paypal_subscription_id, payment_provider)
  WHERE payment_provider = 'paypal';

CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_provider
  ON subscriptions(mp_preapproval_id, payment_provider)
  WHERE payment_provider = 'mercadopago';
