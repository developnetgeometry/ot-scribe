-- Make the ot-attachments bucket public so images can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'ot-attachments';

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ot-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access (since bucket is public)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ot-attachments');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ot-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);