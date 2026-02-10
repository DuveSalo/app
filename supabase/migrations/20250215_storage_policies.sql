-- Storage RLS policies: users can only access files in their company folder
-- Applied to all document storage buckets

CREATE POLICY "Users can upload to their company folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('certificates', 'self-protection-systems', 'qr-documents')
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM companies WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read their company files"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('certificates', 'self-protection-systems', 'qr-documents')
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM companies WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their company files"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('certificates', 'self-protection-systems', 'qr-documents')
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM companies WHERE user_id = auth.uid()
  )
);
