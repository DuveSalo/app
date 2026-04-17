-- ============================================================================
-- Drop MercadoPago as a valid payment method
-- ----------------------------------------------------------------------------
-- MercadoPago integration was removed from the project. The companies table
-- still had `payment_method` defaulting to 'mercadopago', which made every new
-- registration appear as "MercadoPago" in the admin panel even when the user
-- had not chosen any payment method (e.g. trial users).
--
-- This migration:
--   1. Drops the legacy CHECK constraint that allowed 'mercadopago'.
--   2. Makes the column nullable and removes the default, so unset means
--      "user has not chosen a payment method yet" (null).
--   3. Migrates existing rows currently holding 'mercadopago' to NULL.
--   4. Adds a new CHECK constraint that only allows NULL or 'bank_transfer'
--      (the only payment method the platform currently supports).
--   5. Drops the removed provider webhook log table.
-- ============================================================================

ALTER TABLE companies
  DROP CONSTRAINT IF EXISTS companies_payment_method_check;

ALTER TABLE companies
  ALTER COLUMN payment_method DROP NOT NULL,
  ALTER COLUMN payment_method DROP DEFAULT;

UPDATE companies
SET payment_method = NULL
WHERE payment_method = 'mercadopago';

ALTER TABLE companies
  ADD CONSTRAINT companies_payment_method_check
    CHECK (payment_method IS NULL OR payment_method = 'bank_transfer');

COMMENT ON COLUMN companies.payment_method IS
  'Payment method chosen by the user. NULL means no method selected yet (trial users). Currently only ''bank_transfer'' is supported.';

DROP TABLE IF EXISTS mp_webhook_log;

NOTIFY pgrst, 'reload schema';
