-- Migration: Update conservation_certificates table structure
-- Run this in your Supabase SQL Editor

-- Drop the existing table (WARNING: This will delete all existing data)
DROP TABLE IF EXISTS conservation_certificates CASCADE;

-- Recreate the table with correct structure
CREATE TABLE conservation_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  presentation_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  intervener TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  pdf_file_url TEXT,
  pdf_file_path TEXT,
  pdf_file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_conservation_certificates_company_id ON conservation_certificates(company_id);

-- Enable Row Level Security
ALTER TABLE conservation_certificates ENABLE ROW LEVEL SECURITY;

-- Recreate RLS Policies
CREATE POLICY "Users can view certificates of their company"
  ON conservation_certificates FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert certificates to their company"
  ON conservation_certificates FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update certificates of their company"
  ON conservation_certificates FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete certificates of their company"
  ON conservation_certificates FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- Recreate trigger for updated_at
CREATE TRIGGER update_conservation_certificates_updated_at BEFORE UPDATE ON conservation_certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
