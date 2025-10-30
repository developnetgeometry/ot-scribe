-- Add RLS policy for HR to read all user roles
CREATE POLICY "roles_hr_read"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'hr'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);