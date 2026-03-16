-- Admin access to document tables and storage buckets
-- Allows users with app_metadata.role = 'admin' to read/write all documents

-- ─── Document table policies ────────────────────────────

-- fire_extinguishers
CREATE POLICY admin_all_fire_extinguishers ON fire_extinguishers
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- conservation_certificates
CREATE POLICY admin_all_conservation_certificates ON conservation_certificates
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- self_protection_systems
CREATE POLICY admin_all_self_protection_systems ON self_protection_systems
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- qr_documents
CREATE POLICY admin_all_qr_documents ON qr_documents
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- events
CREATE POLICY admin_all_events ON events
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Storage bucket policies ────────────────────────────

-- certificates bucket
CREATE POLICY admin_all_certificates ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'certificates' AND is_admin())
  WITH CHECK (bucket_id = 'certificates' AND is_admin());

-- self-protection-systems bucket
CREATE POLICY admin_all_self_protection_systems_storage ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'self-protection-systems' AND is_admin())
  WITH CHECK (bucket_id = 'self-protection-systems' AND is_admin());

-- qr-documents bucket
CREATE POLICY admin_all_qr_documents_storage ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'qr-documents' AND is_admin())
  WITH CHECK (bucket_id = 'qr-documents' AND is_admin());
