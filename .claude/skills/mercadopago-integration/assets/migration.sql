-- MercadoPago Subscriptions - Database Schema
-- Standard PostgreSQL. Works on: Supabase, AWS RDS, Neon, self-hosted, etc.
-- Run via psql, pgAdmin, Supabase SQL Editor, or your preferred tool.
-- Adjust table/column names as needed for your project.

-- Subscriptions table: one row per subscription
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  mercadopago_preapproval_id TEXT,
  mercadopago_payer_id TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'authorized', 'paused', 'cancelled')),
  amount NUMERIC(10,2) NOT NULL,
  currency_id VARCHAR(3) NOT NULL DEFAULT 'ARS',
  frequency INTEGER NOT NULL DEFAULT 1,
  frequency_type VARCHAR(10) NOT NULL DEFAULT 'months'
    CHECK (frequency_type IN ('months', 'days')),
  external_reference TEXT,
  next_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_preapproval ON subscriptions(mercadopago_preapproval_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email_status ON subscriptions(user_email, status);

-- gen_random_uuid() requires pgcrypto on PostgreSQL < 13:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
