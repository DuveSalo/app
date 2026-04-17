-- Set REPLICA IDENTITY FULL on tables that use Realtime with company_id filters.
-- Without this, DELETE events only include the primary key in the WAL output,
-- so filtered subscriptions (company_id=eq.{id}) can't match DELETE events.

ALTER TABLE fire_extinguishers REPLICA IDENTITY FULL;
ALTER TABLE conservation_certificates REPLICA IDENTITY FULL;
ALTER TABLE self_protection_systems REPLICA IDENTITY FULL;
ALTER TABLE qr_documents REPLICA IDENTITY FULL;
ALTER TABLE events REPLICA IDENTITY FULL;
ALTER TABLE manual_payments REPLICA IDENTITY FULL;
ALTER TABLE subscriptions REPLICA IDENTITY FULL;
ALTER TABLE payment_transactions REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE companies REPLICA IDENTITY FULL;
