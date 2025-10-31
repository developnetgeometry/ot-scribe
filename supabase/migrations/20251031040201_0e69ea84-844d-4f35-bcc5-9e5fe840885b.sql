-- Add new compliance and contact fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ic_no text,
ADD COLUMN IF NOT EXISTS phone_no text,
ADD COLUMN IF NOT EXISTS epf_no text,
ADD COLUMN IF NOT EXISTS socso_no text,
ADD COLUMN IF NOT EXISTS income_tax_no text;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.ic_no IS 'IC/Passport Number';
COMMENT ON COLUMN public.profiles.phone_no IS 'Phone Number';
COMMENT ON COLUMN public.profiles.epf_no IS 'EPF Registration Number';
COMMENT ON COLUMN public.profiles.socso_no IS 'SOCSO Registration Number';
COMMENT ON COLUMN public.profiles.income_tax_no IS 'Income Tax Number';