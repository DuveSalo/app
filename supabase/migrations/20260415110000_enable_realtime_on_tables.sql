-- Enable Supabase Realtime on all tables that need cross-user synchronization.
-- The RealtimeProvider in the frontend subscribes to postgres_changes on these tables
-- and invalidates TanStack Query caches so all users see up-to-date state.

-- User-facing document tables
ALTER PUBLICATION supabase_realtime ADD TABLE fire_extinguishers;
ALTER PUBLICATION supabase_realtime ADD TABLE conservation_certificates;
ALTER PUBLICATION supabase_realtime ADD TABLE self_protection_systems;
ALTER PUBLICATION supabase_realtime ADD TABLE qr_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Payment and subscription tables
ALTER PUBLICATION supabase_realtime ADD TABLE manual_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_transactions;

-- Notification table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Company table (admin sees school status changes)
ALTER PUBLICATION supabase_realtime ADD TABLE companies;
