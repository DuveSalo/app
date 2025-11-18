-- Create fire_extinguishers table
CREATE TABLE IF NOT EXISTS fire_extinguishers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Fecha de Control
  control_date DATE NOT NULL,

  -- Identificación
  extinguisher_number TEXT NOT NULL,
  type TEXT NOT NULL,
  capacity TEXT NOT NULL,
  class TEXT NOT NULL,

  -- Ubicación e Información
  position_number TEXT NOT NULL,
  charge_expiration_date DATE NOT NULL,
  hydraulic_pressure_expiration_date DATE NOT NULL,
  manufacturing_year TEXT NOT NULL,
  tag_color TEXT NOT NULL,

  -- Condiciones Controladas
  labels_legible BOOLEAN NOT NULL DEFAULT true,
  pressure_within_range BOOLEAN NOT NULL DEFAULT true,
  has_seal_and_safety BOOLEAN NOT NULL DEFAULT true,
  instructions_legible BOOLEAN NOT NULL DEFAULT true,
  container_condition TEXT NOT NULL,
  nozzle_condition TEXT NOT NULL,

  -- Gabinete
  glass_condition TEXT NOT NULL CHECK (glass_condition IN ('Sí', 'No', 'N/A')),
  door_opens_easily TEXT NOT NULL CHECK (door_opens_easily IN ('Sí', 'No', 'N/A')),
  cabinet_clean TEXT NOT NULL CHECK (cabinet_clean IN ('Sí', 'No', 'N/A')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on company_id for faster queries
CREATE INDEX IF NOT EXISTS idx_fire_extinguishers_company_id ON fire_extinguishers(company_id);

-- Create index on control_date for sorting
CREATE INDEX IF NOT EXISTS idx_fire_extinguishers_control_date ON fire_extinguishers(control_date DESC);

-- Create index on charge_expiration_date for expiration queries
CREATE INDEX IF NOT EXISTS idx_fire_extinguishers_charge_expiration ON fire_extinguishers(charge_expiration_date);

-- Enable Row Level Security
ALTER TABLE fire_extinguishers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their company's fire extinguishers"
  ON fire_extinguishers
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert fire extinguishers for their company"
  ON fire_extinguishers
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company's fire extinguishers"
  ON fire_extinguishers
  FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their company's fire extinguishers"
  ON fire_extinguishers
  FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fire_extinguishers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fire_extinguishers_updated_at
  BEFORE UPDATE ON fire_extinguishers
  FOR EACH ROW
  EXECUTE FUNCTION update_fire_extinguishers_updated_at();
