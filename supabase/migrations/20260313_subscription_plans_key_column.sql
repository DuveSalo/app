-- ============================================================================
-- Add key column, landing metadata, and anon RLS to subscription_plans
-- ============================================================================

-- 1. Add key column (stable identifier used by frontend & MP integration)
ALTER TABLE subscription_plans ADD COLUMN key text;

-- 2. Backfill keys from existing plan names
UPDATE subscription_plans SET key = 'basic' WHERE name = 'Básico';
UPDATE subscription_plans SET key = 'standard' WHERE name = 'Estándar';
UPDATE subscription_plans SET key = 'premium' WHERE name = 'Premium';

-- 3. Make key NOT NULL and UNIQUE after backfill
ALTER TABLE subscription_plans ALTER COLUMN key SET NOT NULL;
ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_key_unique UNIQUE (key);

-- 4. Landing page metadata columns
ALTER TABLE subscription_plans ADD COLUMN description text NOT NULL DEFAULT '';
ALTER TABLE subscription_plans ADD COLUMN tag text;
ALTER TABLE subscription_plans ADD COLUMN highlighted boolean NOT NULL DEFAULT false;

-- 5. Backfill landing metadata
UPDATE subscription_plans SET description = 'Para escuelas pequeñas' WHERE key = 'basic';
UPDATE subscription_plans SET description = 'La opción más popular', highlighted = true, tag = 'Más Popular' WHERE key = 'standard';
UPDATE subscription_plans SET description = 'Acceso completo sin límites' WHERE key = 'premium';

-- 6. Anon RLS: landing page needs prices without auth
CREATE POLICY anon_read_active_plans ON subscription_plans
  FOR SELECT TO anon USING (is_active = true);
GRANT SELECT ON subscription_plans TO anon;

-- 7. Index on key for fast lookups (used by edge functions)
CREATE UNIQUE INDEX idx_subscription_plans_key ON subscription_plans(key);
