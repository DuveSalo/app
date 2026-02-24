-- Migration: Add trial_ends_at column to companies table
-- Enables 14-day free trial for new users

ALTER TABLE companies
  ADD COLUMN trial_ends_at TIMESTAMPTZ DEFAULT NULL;

-- Index for efficient queries on trial status
CREATE INDEX idx_companies_trial_ends_at
  ON companies(trial_ends_at)
  WHERE trial_ends_at IS NOT NULL AND is_subscribed = false;

COMMENT ON COLUMN companies.trial_ends_at IS
  '14-day free trial expiry timestamp. NULL means no trial (legacy or already subscribed).';

NOTIFY pgrst, 'reload schema';
