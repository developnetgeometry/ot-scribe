-- Allow BOD to read profiles for approval purposes
CREATE POLICY "prof_bod_read" ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'bod'::app_role));