-- Update profiles table to use pending_password status
ALTER TABLE public.profiles 
ALTER COLUMN status SET DEFAULT 'pending_password';

-- Update existing pending records to pending_password for clarity
UPDATE public.profiles 
SET status = 'pending_password' 
WHERE status = 'pending';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.status IS 'User status: pending_password (must change password on first login), active (full access)';