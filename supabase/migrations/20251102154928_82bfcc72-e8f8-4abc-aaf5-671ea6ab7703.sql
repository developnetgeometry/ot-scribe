-- Create company_profile table
CREATE TABLE public.company_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  registration_no text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;

-- Everyone can read company profile
CREATE POLICY "cp_read_all" ON public.company_profile
  FOR SELECT USING (true);

-- Only HR/Admin can modify
CREATE POLICY "cp_write_hr_admin" ON public.company_profile
  FOR ALL USING (
    has_role(auth.uid(), 'hr'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Insert initial company data
INSERT INTO public.company_profile (name, registration_no, address, phone)
VALUES (
  'TIDAL TECHNICAL SUPPLY & SERVICES SDN. BHD.',
  '(202301035098 (1529021-A))',
  'LEVEL 2, MENARA TSR, NO 12 JALAN PJU 7/3, MUTIARA DAMANSARA',
  '0377335253'
);

-- Add trigger for updated_at
CREATE TRIGGER update_company_profile_updated_at
BEFORE UPDATE ON public.company_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();