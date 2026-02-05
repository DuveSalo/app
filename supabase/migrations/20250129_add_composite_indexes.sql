-- Composite indexes for common queries
-- These indexes optimize dashboard and list queries that filter by company_id and dates

-- Index for certificates by company and expiration date
CREATE INDEX IF NOT EXISTS idx_conservation_certificates_company_expiration
ON conservation_certificates(company_id, expiration_date);

-- Index for self protection systems by company and expiration date
CREATE INDEX IF NOT EXISTS idx_self_protection_systems_company_expiration
ON self_protection_systems(company_id, expiration_date);

-- Index for fire extinguishers by company and control date
CREATE INDEX IF NOT EXISTS idx_fire_extinguishers_company_control
ON fire_extinguishers(company_id, control_date);

-- Index for QR documents by company and type
CREATE INDEX IF NOT EXISTS idx_qr_documents_company_type
ON qr_documents(company_id, type);

-- Partial index for unread notifications (common filter)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
ON notifications(user_id, is_read) WHERE is_read = false;

-- Index for events by company and date
CREATE INDEX IF NOT EXISTS idx_events_company_date
ON events(company_id, event_date);
