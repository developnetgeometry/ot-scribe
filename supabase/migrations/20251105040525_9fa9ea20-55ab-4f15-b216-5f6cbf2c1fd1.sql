-- Drop old BOD-specific policy
DROP POLICY IF EXISTS "prof_bod_read" ON public.profiles;

-- Drop existing HR read policy
DROP POLICY IF EXISTS "prof_hr_read" ON public.profiles;

-- Recreate HR read policy to include Management role
CREATE POLICY "prof_hr_read" ON public.profiles
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'hr'::app_role) OR 
  has_role(auth.uid(), 'management'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);