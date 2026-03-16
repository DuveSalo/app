-- ============================================================================
-- Phase F: subscription_plans table for plan configuration
-- ============================================================================

-- 1. Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price integer NOT NULL CHECK (price >= 0), -- cents
  features text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_sort ON subscription_plans(sort_order);

-- 3. Updated_at trigger
CREATE OR REPLACE FUNCTION update_subscription_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER trg_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_subscription_plans_updated_at();

-- 4. Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Admins can do everything
CREATE POLICY admin_all_subscription_plans ON subscription_plans
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Any authenticated user can read active plans (for subscription selection)
CREATE POLICY public_read_active_plans ON subscription_plans
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Service role full access
CREATE POLICY service_all_subscription_plans ON subscription_plans
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Grant permissions
GRANT SELECT ON subscription_plans TO authenticated;
GRANT ALL ON subscription_plans TO service_role;

-- 7. Seed default plans
INSERT INTO subscription_plans (name, price, features, is_active, sort_order) VALUES
  ('Básico', 2500000, ARRAY['Gestión de 5 módulos', 'Dashboard de vencimientos', 'Soporte por email'], true, 1),
  ('Estándar', 4900000, ARRAY['Gestión de 10 módulos', 'Alertas avanzadas', 'Soporte prioritario'], true, 2),
  ('Premium', 8900000, ARRAY['Módulos ilimitados', 'Reportes personalizados', 'Soporte 24/7 por teléfono'], true, 3)
ON CONFLICT DO NOTHING;
