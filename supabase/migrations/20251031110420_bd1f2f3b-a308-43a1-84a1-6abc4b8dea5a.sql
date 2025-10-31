-- Backfill missing supervisor_id on existing OT requests
UPDATE public.ot_requests r
SET supervisor_id = p.supervisor_id
FROM public.profiles p
WHERE r.employee_id = p.id
  AND r.supervisor_id IS NULL
  AND p.supervisor_id IS NOT NULL;

-- Create function to auto-set supervisor_id from employee profile
CREATE OR REPLACE FUNCTION public.set_ot_supervisor_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If supervisor_id is not provided, get it from the employee's profile
  IF NEW.supervisor_id IS NULL THEN
    SELECT supervisor_id INTO NEW.supervisor_id
    FROM public.profiles
    WHERE id = NEW.employee_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set supervisor_id on insert
CREATE TRIGGER ot_requests_set_supervisor
BEFORE INSERT ON public.ot_requests
FOR EACH ROW EXECUTE PROCEDURE public.set_ot_supervisor_id();