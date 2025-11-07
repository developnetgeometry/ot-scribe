-- Create a security definer function that allows looking up email by employee_id
-- This is needed for the login flow before users are authenticated
CREATE OR REPLACE FUNCTION public.lookup_email_by_employee_id(p_employee_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  FROM profiles
  WHERE employee_id ILIKE p_employee_id
  LIMIT 1;
  
  RETURN v_email;
END;
$$;

-- Grant execute permission to anonymous users (needed for login)
GRANT EXECUTE ON FUNCTION public.lookup_email_by_employee_id(text) TO anon;

-- Grant execute permission to authenticated users as well
GRANT EXECUTE ON FUNCTION public.lookup_email_by_employee_id(text) TO authenticated;