-- Add OT eligible column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_ot_eligible BOOLEAN DEFAULT true NOT NULL;

-- Add helpful comment
COMMENT ON COLUMN public.profiles.is_ot_eligible IS 'Manual override for OT eligibility. When false, employee cannot submit OT requests regardless of rules.';

-- Update the check_ot_eligibility function to check this flag first
CREATE OR REPLACE FUNCTION public.check_ot_eligibility(_employee_id uuid, _ot_date date)
RETURNS TABLE(is_eligible boolean, rule_id uuid, rule_name text, reason text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  emp record;
  r record;
BEGIN
  -- Fetch employee data including is_ot_eligible flag
  SELECT 
    p.basic_salary,
    p.department_id,
    p.employment_type,
    p.is_ot_eligible,
    COALESCE(array_agg(ur.role), ARRAY[]::app_role[]) as roles
  INTO emp
  FROM profiles p
  LEFT JOIN user_roles ur ON ur.user_id = p.id
  WHERE p.id = _employee_id
  GROUP BY p.id, p.basic_salary, p.department_id, p.employment_type, p.is_ot_eligible;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, 'Employee not found';
    RETURN;
  END IF;
  
  -- CHECK MANUAL OVERRIDE FIRST
  IF NOT emp.is_ot_eligible THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, 'Employee is marked as not eligible for OT';
    RETURN;
  END IF;
  
  -- Check salary range
  FOR r IN 
    SELECT * FROM ot_eligibility_rules 
    WHERE is_active 
    ORDER BY created_at DESC
  LOOP
    IF emp.basic_salary < r.min_salary OR emp.basic_salary > r.max_salary THEN
      CONTINUE;
    END IF;
    
    IF array_length(r.department_ids, 1) > 0 AND NOT (emp.department_id = ANY(r.department_ids)) THEN
      CONTINUE;
    END IF;
    
    IF array_length(r.role_ids, 1) > 0 AND NOT (emp.roles::text[] && r.role_ids) THEN
      CONTINUE;
    END IF;
    
    IF array_length(r.employment_types, 1) > 0 AND NOT (emp.employment_type = ANY(r.employment_types)) THEN
      CONTINUE;
    END IF;
    
    RETURN QUERY SELECT true, r.id, r.rule_name, 'Eligible under ' || r.rule_name;
    RETURN;
  END LOOP;
  
  RETURN QUERY SELECT false, NULL::uuid, NULL::text, 'No matching eligibility rule found';
END;
$function$;