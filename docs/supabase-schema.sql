-- SafetyGuard Pro Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
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

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conservation Certificates table
CREATE TABLE IF NOT EXISTS conservation_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  location TEXT NOT NULL,
  serial_number TEXT,
  installation_date DATE,
  last_maintenance_date DATE NOT NULL,
  next_maintenance_date DATE NOT NULL,
  maintenance_frequency TEXT NOT NULL,
  maintenance_company TEXT NOT NULL,
  responsible_technician TEXT NOT NULL,
  status TEXT NOT NULL,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Self Protection Systems table
CREATE TABLE IF NOT EXISTS self_protection_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  system_name TEXT NOT NULL,
  system_type TEXT NOT NULL,
  location TEXT NOT NULL,
  installation_date DATE,
  last_inspection_date DATE NOT NULL,
  next_inspection_date DATE NOT NULL,
  inspection_frequency TEXT NOT NULL,
  responsible_company TEXT NOT NULL,
  status TEXT NOT NULL,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Documents table
CREATE TABLE IF NOT EXISTS qr_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  floor TEXT,
  unit TEXT,
  pdf_file_url TEXT,
  pdf_file_path TEXT,
  qr_code_data TEXT,
  upload_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  description TEXT NOT NULL,
  corrective_actions TEXT NOT NULL,
  testimonials JSONB DEFAULT '[]'::jsonb,
  observations JSONB DEFAULT '[]'::jsonb,
  final_checks JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_conservation_certificates_company_id ON conservation_certificates(company_id);
CREATE INDEX IF NOT EXISTS idx_self_protection_systems_company_id ON self_protection_systems(company_id);
CREATE INDEX IF NOT EXISTS idx_qr_documents_company_id ON qr_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_qr_documents_type ON qr_documents(type);
CREATE INDEX IF NOT EXISTS idx_events_company_id ON events(company_id);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE conservation_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_protection_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company"
  ON companies FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for employees
CREATE POLICY "Users can view employees of their company"
  ON employees FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert employees to their company"
  ON employees FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update employees of their company"
  ON employees FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete employees of their company"
  ON employees FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- RLS Policies for conservation_certificates
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

-- RLS Policies for self_protection_systems
CREATE POLICY "Users can view systems of their company"
  ON self_protection_systems FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert systems to their company"
  ON self_protection_systems FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update systems of their company"
  ON self_protection_systems FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete systems of their company"
  ON self_protection_systems FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- RLS Policies for qr_documents
CREATE POLICY "Users can view QR documents of their company"
  ON qr_documents FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert QR documents to their company"
  ON qr_documents FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update QR documents of their company"
  ON qr_documents FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete QR documents of their company"
  ON qr_documents FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- RLS Policies for events
CREATE POLICY "Users can view events of their company"
  ON events FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert events to their company"
  ON events FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update events of their company"
  ON events FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete events of their company"
  ON events FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conservation_certificates_updated_at BEFORE UPDATE ON conservation_certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_self_protection_systems_updated_at BEFORE UPDATE ON self_protection_systems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_documents_updated_at BEFORE UPDATE ON qr_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
