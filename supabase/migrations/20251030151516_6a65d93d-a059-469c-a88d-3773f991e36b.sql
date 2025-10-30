-- Allow users to update their own status from pending_setup to active during first-time password setup
CREATE POLICY "prof_self_update_status"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() 
  AND status = 'pending_setup'
)
WITH CHECK (
  id = auth.uid() 
  AND status = 'active'
);