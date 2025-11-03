-- Create company-assets bucket (PUBLIC so logos can be displayed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true);

-- RLS Policy: Anyone can view
CREATE POLICY "Public Access for Company Assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-assets');

-- RLS Policy: Only HR/Admin can upload/update
CREATE POLICY "HR and Admin can upload company assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-assets' 
  AND (
    has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin')
  )
);

-- RLS Policy: Only HR/Admin can update
CREATE POLICY "HR and Admin can update company assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-assets' 
  AND (
    has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin')
  )
);

-- RLS Policy: Only HR/Admin can delete
CREATE POLICY "HR and Admin can delete company assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-assets' 
  AND (
    has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin')
  )
);