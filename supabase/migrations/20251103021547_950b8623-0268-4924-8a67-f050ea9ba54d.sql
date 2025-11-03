-- Step 1: Add new enum values to ot_status
-- These must be committed before they can be used in UPDATE statements
ALTER TYPE public.ot_status ADD VALUE IF NOT EXISTS 'supervisor_verified';
ALTER TYPE public.ot_status ADD VALUE IF NOT EXISTS 'hr_certified';
ALTER TYPE public.ot_status ADD VALUE IF NOT EXISTS 'bod_approved';