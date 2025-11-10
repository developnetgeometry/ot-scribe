-- Create role change audit trail table
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  old_role app_role,
  new_role app_role NOT NULL,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT,
  ip_address TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- Only HR and Admin can view audit logs
CREATE POLICY "role_audit_hr_admin_read"
ON public.role_change_audit
FOR SELECT
USING (
  has_role(auth.uid(), 'hr'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- System can insert audit logs
CREATE POLICY "role_audit_system_insert"
ON public.role_change_audit
FOR INSERT
WITH CHECK (true);

-- Create function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_role_val app_role;
BEGIN
  -- On DELETE, log the removal
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_change_audit (user_id, old_role, new_role, changed_by)
    VALUES (OLD.user_id, OLD.role, NULL, auth.uid());
    RETURN OLD;
  END IF;
  
  -- On INSERT, check if there was a previous role
  IF TG_OP = 'INSERT' THEN
    -- Get the most recent old role from audit or assume this is initial assignment
    SELECT old_role INTO old_role_val
    FROM public.role_change_audit
    WHERE user_id = NEW.user_id
    ORDER BY changed_at DESC
    LIMIT 1;
    
    INSERT INTO public.role_change_audit (user_id, old_role, new_role, changed_by)
    VALUES (NEW.user_id, old_role_val, NEW.role, auth.uid());
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS role_change_audit_trigger ON public.user_roles;
CREATE TRIGGER role_change_audit_trigger
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.log_role_change();

-- Add index for better audit query performance
CREATE INDEX IF NOT EXISTS idx_role_audit_user_id ON public.role_change_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_changed_at ON public.role_change_audit(changed_at DESC);