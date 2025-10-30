-- Create storage bucket for OT attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ot-attachments', 'ot-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any
DROP POLICY IF EXISTS stor_insert ON storage.objects;
DROP POLICY IF EXISTS stor_self ON storage.objects;
DROP POLICY IF EXISTS stor_reviewers ON storage.objects;

-- Policy: Users can upload their own attachments
CREATE POLICY stor_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'ot-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own attachments
CREATE POLICY stor_self ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'ot-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Reviewers (supervisor, HR, BOD, admin) can view all attachments
CREATE POLICY stor_reviewers ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'ot-attachments' 
  AND (
    public.has_role(auth.uid(), 'hr') 
    OR public.has_role(auth.uid(), 'supervisor') 
    OR public.has_role(auth.uid(), 'bod') 
    OR public.has_role(auth.uid(), 'admin')
  )
);