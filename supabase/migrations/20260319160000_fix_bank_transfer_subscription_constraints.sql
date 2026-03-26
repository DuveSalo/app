-- Fix subscriptions table constraints to support bank_transfer payment provider
-- The chk_payment_provider and chk_provider_consistency constraints were missing
-- bank_transfer, causing the subscription insert to fail silently on bank transfers.

-- 1. Update payment_provider constraint to include bank_transfer
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS chk_payment_provider;
ALTER TABLE subscriptions ADD CONSTRAINT chk_payment_provider
  CHECK (payment_provider IN ('paypal', 'mercadopago', 'bank_transfer'));

-- 2. Update provider consistency: bank_transfer requires no external ID
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS chk_provider_consistency;
ALTER TABLE subscriptions ADD CONSTRAINT chk_provider_consistency CHECK (
  (payment_provider = 'paypal' AND paypal_subscription_id IS NOT NULL) OR
  (payment_provider = 'mercadopago' AND mp_preapproval_id IS NOT NULL) OR
  (payment_provider = 'bank_transfer') OR
  (payment_provider IS NULL)
);

NOTIFY pgrst, 'reload schema';
