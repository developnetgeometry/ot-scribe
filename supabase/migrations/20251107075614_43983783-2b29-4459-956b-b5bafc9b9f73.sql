-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  registration_no TEXT,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add company_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Add index for performance
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);

-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Everyone can read companies"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "HR/Admin can manage companies"
  ON public.companies FOR ALL
  USING (public.has_role(auth.uid(), 'hr'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

-- Seed initial companies from Excel data
INSERT INTO public.companies (name, code) VALUES
  ('TIDAL Venture Sdn Bhd', 'TIDAL'),
  ('TIDAL Technical Supply & Services Sdn Bhd', 'TTSS'),
  ('Janamurni Sdn Bhd', 'JMSB'),
  ('TIDAL Holdings Sdn Bhd', 'THSB');