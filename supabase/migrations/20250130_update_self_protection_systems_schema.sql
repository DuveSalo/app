-- Update self_protection_systems table schema to match the application requirements

-- Drop old table and recreate with correct schema
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

-- Create index on company_id for faster queries
CREATE INDEX idx_self_protection_systems_company_id ON self_protection_systems(company_id);

-- Create index on expiration_date for expiration queries
CREATE INDEX idx_self_protection_systems_expiration_date ON self_protection_systems(expiration_date);

-- Enable RLS
ALTER TABLE self_protection_systems ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view self_protection_systems of their company"
    ON self_protection_systems FOR SELECT
    USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert self_protection_systems for their company"
    ON self_protection_systems FOR INSERT
    WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update self_protection_systems of their company"
    ON self_protection_systems FOR UPDATE
    USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete self_protection_systems of their company"
    ON self_protection_systems FOR DELETE
    USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_self_protection_systems_updated_at
    BEFORE UPDATE ON self_protection_systems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
