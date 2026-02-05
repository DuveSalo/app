-- Advanced Indexes Migration
-- Adds GIN indexes for JSONB columns, partial indexes for frequently filtered status values,
-- and unique constraints for UPSERT support

-- ============================================
-- UNIQUE CONSTRAINTS FOR UPSERT SUPPORT
-- ============================================

-- Unique constraint on mp_payment_id for idempotent payment processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_mp_payment_id_unique
  ON payment_transactions(mp_payment_id)
  WHERE mp_payment_id IS NOT NULL;

-- Unique constraint on mp_preapproval_id for idempotent subscription handling
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_mp_preapproval_id_unique
  ON subscriptions(mp_preapproval_id)
  WHERE mp_preapproval_id IS NOT NULL;

-- ============================================
-- GIN INDEXES FOR JSONB COLUMNS
-- Enables fast containment queries (@>, ?, ?&, ?|)
-- ============================================

-- GIN index for companies.services (enables: WHERE services @> '{"module": true}')
CREATE INDEX IF NOT EXISTS idx_companies_services_gin
  ON companies USING GIN(services);

-- GIN index for companies.payment_methods (enables: WHERE payment_methods @> '[{"type": "card"}]')
CREATE INDEX IF NOT EXISTS idx_companies_payment_methods_gin
  ON companies USING GIN(payment_methods);

-- GIN index for self_protection_systems.drills (enables: WHERE drills @> '[{"date": "2024-01-01"}]')
CREATE INDEX IF NOT EXISTS idx_self_protection_systems_drills_gin
  ON self_protection_systems USING GIN(drills);

-- GIN index for payment_transactions.mp_response (for debugging/analytics queries)
CREATE INDEX IF NOT EXISTS idx_payment_transactions_mp_response_gin
  ON payment_transactions USING GIN(mp_response);

-- ============================================
-- PARTIAL INDEXES FOR STATUS FIELDS
-- Optimizes frequent queries for specific status values
-- ============================================

-- Partial index for active subscriptions (most common query)
CREATE INDEX IF NOT EXISTS idx_subscriptions_active
  ON subscriptions(company_id)
  WHERE status = 'authorized';

-- Partial index for pending subscriptions (checkout flow)
CREATE INDEX IF NOT EXISTS idx_subscriptions_pending
  ON subscriptions(company_id)
  WHERE status = 'pending';

-- Partial index for active companies (dashboard, feature access)
CREATE INDEX IF NOT EXISTS idx_companies_subscribed
  ON companies(user_id)
  WHERE is_subscribed = true;

-- Partial index for companies with active subscription status
CREATE INDEX IF NOT EXISTS idx_companies_active_subscription
  ON companies(id)
  WHERE subscription_status = 'active';

-- Partial index for pending payment transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_pending
  ON payment_transactions(subscription_id)
  WHERE status = 'pending';

-- Partial index for approved payment transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_approved
  ON payment_transactions(subscription_id)
  WHERE status = 'approved';

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================

-- Index for finding subscriptions by company and status
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_status
  ON subscriptions(company_id, status);

-- Index for payment transactions by date range queries
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date
  ON payment_transactions(company_id, date_approved DESC)
  WHERE date_approved IS NOT NULL;

-- ============================================
-- COVERING INDEX FOR NOTIFICATION QUERIES
-- Includes frequently selected columns for index-only scans
-- ============================================
-- Note: PostgreSQL 11+ supports INCLUDE clause
CREATE INDEX IF NOT EXISTS idx_notifications_company_covering
  ON notifications(company_id, is_read, created_at DESC);
