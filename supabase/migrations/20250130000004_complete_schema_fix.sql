-- Complete schema setup and fix for self_protection_systems

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cuit TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  locality TEXT NOT NULL,
  province TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Argentina',
  rama_key TEXT,
  owner_entity TEXT,
  phone TEXT,
  is_subscribed BOOLEAN DEFAULT FALSE,
  selected_plan TEXT,
  subscription_status TEXT,
  subscription_renewal_date DATE,
  services JSONB DEFAULT '{}'::jsonb,
  payment_methods JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old self_protection_systems table and recreate with correct schema
DROP TABLE IF EXISTS self_protection_systems CASCADE;

CREATE TABLE self_protection_systems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    probatory_disposition_date DATE,
    probatory_disposition_pdf TEXT,
    probatory_disposition_pdf_name TEXT,
    extension_date DATE NOT NULL,
    extension_pdf TEXT,
    extension_pdf_name TEXT,
    expiration_date DATE NOT NULL,
    drills JSONB NOT NULL DEFAULT '[]'::jsonb,
    intervener TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_self_protection_systems_company_id ON self_protection_systems(company_id);
CREATE INDEX idx_self_protection_systems_expiration_date ON self_protection_systems(expiration_date);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_protection_systems ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies (if not exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'companies'
        AND policyname = 'Users can view their own company'
    ) THEN
        CREATE POLICY "Users can view their own company"
          ON companies FOR SELECT
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'companies'
        AND policyname = 'Users can insert their own company'
    ) THEN
        CREATE POLICY "Users can insert their own company"
          ON companies FOR INSERT
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'companies'
        AND policyname = 'Users can update their own company'
    ) THEN
        CREATE POLICY "Users can update their own company"
          ON companies FOR UPDATE
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'companies'
        AND policyname = 'Users can delete their own company'
    ) THEN
        CREATE POLICY "Users can delete their own company"
          ON companies FOR DELETE
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- RLS Policies for self_protection_systems
CREATE POLICY "Users can view self_protection_systems of their company"
    ON self_protection_systems FOR SELECT
    USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert self_protection_systems for their company"
    ON self_protection_systems FOR INSERT
    WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update self_protection_systems of their company"
    ON self_protection_systems FOR UPDATE
    USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete self_protection_systems of their company"
    ON self_protection_systems FOR DELETE
    USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- Create triggers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_companies_updated_at'
    ) THEN
        CREATE TRIGGER update_companies_updated_at
        BEFORE UPDATE ON companies
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

CREATE TRIGGER update_self_protection_systems_updated_at
    BEFORE UPDATE ON self_protection_systems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
