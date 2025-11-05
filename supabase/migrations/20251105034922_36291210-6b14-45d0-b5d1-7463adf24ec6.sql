-- Drop old policies that reference 'bod'
DROP POLICY IF EXISTS "otr_hr_read" ON public.ot_requests;
DROP POLICY IF EXISTS "otr_hr_update" ON public.ot_requests;

-- Recreate policies with 'management' role
CREATE POLICY "otr_hr_read" ON public.ot_requests
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'hr'::app_role) OR 
  has_role(auth.uid(), 'management'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "otr_hr_update" ON public.ot_requests
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'hr'::app_role) OR 
  has_role(auth.uid(), 'management'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);