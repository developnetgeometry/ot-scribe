-- Allow HR and Admin users to insert departments
CREATE POLICY "dep_hr_insert"
ON public.departments
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'hr'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow HR and Admin users to update departments
CREATE POLICY "dep_hr_update"
ON public.departments
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'hr'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'hr'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow HR and Admin users to delete departments
CREATE POLICY "dep_hr_delete"
ON public.departments
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'hr'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);