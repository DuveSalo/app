-- Add admin RLS policies to payment_transactions and subscriptions tables.
-- These were missing, so admins couldn't see MercadoPago payments or subscriptions.

-- payment_transactions: admin full access
CREATE POLICY admin_all_payment_transactions ON payment_transactions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- subscriptions: admin full access
CREATE POLICY admin_all_subscriptions ON subscriptions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
