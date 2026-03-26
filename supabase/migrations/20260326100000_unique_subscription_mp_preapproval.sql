-- Prevent duplicate MercadoPago subscriptions per company.
-- Partial index: only applies when mp_preapproval_id is not null (bank transfers have null).
-- This is a safety net for webhook idempotency — even if webhook-mercadopago's
-- notification_id check fails, this constraint prevents duplicate subscription records.
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_company_mp_preapproval
  ON subscriptions (company_id, mp_preapproval_id)
  WHERE mp_preapproval_id IS NOT NULL;
