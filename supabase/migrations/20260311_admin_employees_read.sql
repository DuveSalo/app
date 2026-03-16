-- Allow admin users to read employees from any company
-- Fixes: admin panel school detail showing empty email/employees
CREATE POLICY "admin_select_employees"
  ON employees
  FOR SELECT
  USING (is_admin());
