-- Allow employees to update their own pending OT requests
CREATE POLICY "otr_emp_update_pending" 
ON public.ot_requests
FOR UPDATE
TO authenticated
USING (
  employee_id = auth.uid() 
  AND status = 'pending_verification'
)
WITH CHECK (
  employee_id = auth.uid() 
  AND status = 'pending_verification'
);