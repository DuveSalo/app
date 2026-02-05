-- ============================================
-- MIGRACIÓN: Eliminación en cascada de usuarios
-- ============================================
-- Esta migración asegura que al eliminar un usuario de auth.users,
-- se eliminen automáticamente:
-- 1. Todos sus archivos en Storage
-- 2. Su empresa (companies)
-- 3. Todos los datos relacionados con la empresa
-- ============================================

-- Función que elimina los archivos del storage cuando se elimina un usuario
CREATE OR REPLACE FUNCTION public.delete_user_storage_objects()
RETURNS TRIGGER AS $$
BEGIN
  -- Eliminar todos los archivos del storage que pertenecen al usuario
  DELETE FROM storage.objects WHERE owner = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar el trigger si ya existe (para poder recrearlo)
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Crear trigger que se ejecuta ANTES de eliminar un usuario
-- Esto elimina los archivos del storage antes de que las FK en cascada eliminen el resto
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_user_storage_objects();

-- ============================================
-- Verificar y actualizar las FK existentes para asegurar CASCADE
-- ============================================

-- 1. companies -> auth.users (ya tiene CASCADE, pero verificamos)
ALTER TABLE public.companies
  DROP CONSTRAINT IF EXISTS companies_user_id_fkey;

ALTER TABLE public.companies
  ADD CONSTRAINT companies_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 2. notifications -> auth.users
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 3. audit_logs -> auth.users (SET NULL para mantener historial)
ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- ============================================
-- Las siguientes tablas ya tienen CASCADE hacia companies,
-- así que se eliminarán automáticamente cuando se elimine la empresa:
-- - fire_extinguishers (company_id -> companies)
-- - self_protection_systems (company_id -> companies)
-- - conservation_certificates (company_id -> companies)
-- - events (company_id -> companies)
-- - employees (company_id -> companies)
-- - qr_documents (company_id -> companies)
-- - notifications (company_id -> companies)
-- ============================================

-- Comentario para documentación
COMMENT ON FUNCTION public.delete_user_storage_objects() IS
'Elimina automáticamente todos los archivos del Storage cuando se elimina un usuario de auth.users';
