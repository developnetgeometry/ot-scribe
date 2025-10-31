-- Allow HR and Admin to delete user roles
CREATE POLICY "roles_hr_delete" 
ON user_roles 
FOR DELETE 
TO authenticated
USING (
  has_role(auth.uid(), 'hr'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow HR and Admin to insert user roles
CREATE POLICY "roles_hr_insert" 
ON user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'hr'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);