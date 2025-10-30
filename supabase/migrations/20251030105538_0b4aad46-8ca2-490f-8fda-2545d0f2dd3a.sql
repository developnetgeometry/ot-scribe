-- Create enums (skip if exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('employee','supervisor','hr','bod','admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.ot_status AS ENUM ('pending_verification','verified','approved','reviewed','rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.day_type AS ENUM ('weekday','saturday','sunday','public_holiday');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  department_id uuid REFERENCES public.departments(id),
  basic_salary numeric(10,2) NOT NULL,
  employment_type text,
  designation text,
  position text,
  supervisor_id uuid REFERENCES public.profiles(id),
  joining_date date,
  work_location text,
  state text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create public_holidays table
CREATE TABLE IF NOT EXISTS public.public_holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_date date NOT NULL UNIQUE,
  holiday_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create ot_settings table
CREATE TABLE IF NOT EXISTS public.ot_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_threshold numeric(10,2) DEFAULT 4000.00,
  max_daily_hours numeric(4,2) DEFAULT 12.00,
  submission_limit_days integer DEFAULT 3,
  rounding_rule text DEFAULT 'nearest_0.5',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Insert default settings (only if empty)
INSERT INTO public.ot_settings(salary_threshold, max_daily_hours, submission_limit_days) 
SELECT 4000, 12, 3
WHERE NOT EXISTS (SELECT 1 FROM public.ot_settings);

-- Create ot_eligibility_rules table
CREATE TABLE IF NOT EXISTS public.ot_eligibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  min_salary numeric DEFAULT 0,
  max_salary numeric DEFAULT 999999,
  department_ids uuid[] DEFAULT '{}',
  role_ids text[] DEFAULT '{}',
  employment_types text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Insert default eligibility rule (only if empty)
INSERT INTO public.ot_eligibility_rules(rule_name, min_salary, max_salary, is_active) 
SELECT 'Standard Eligibility (Salary < 4000)', 0, 4000, true
WHERE NOT EXISTS (SELECT 1 FROM public.ot_eligibility_rules);

-- Create ot_rate_formulas table
CREATE TABLE IF NOT EXISTS public.ot_rate_formulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_name text NOT NULL,
  day_type day_type NOT NULL,
  employee_category text NOT NULL DEFAULT 'All',
  base_formula text NOT NULL,
  multiplier numeric NOT NULL,
  conditional_logic jsonb DEFAULT '{}',
  effective_from date NOT NULL,
  effective_to date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Insert default rate formulas (only if empty)
INSERT INTO public.ot_rate_formulas(formula_name, day_type, base_formula, multiplier, effective_from) 
SELECT * FROM (VALUES
  ('Weekday Standard Rate', 'weekday'::day_type, 'Basic / 26 / 8', 1.5, '2024-01-01'::date),
  ('Saturday Standard Rate', 'saturday'::day_type, 'Basic / 26 / 8', 2.0, '2024-01-01'::date),
  ('Sunday Standard Rate', 'sunday'::day_type, 'Basic / 26', 1.0, '2024-01-01'::date),
  ('Public Holiday Standard Rate', 'public_holiday'::day_type, 'Basic / 26', 2.0, '2024-01-01'::date)
) AS v(formula_name, day_type, base_formula, multiplier, effective_from)
WHERE NOT EXISTS (SELECT 1 FROM public.ot_rate_formulas);

-- Create ot_approval_thresholds table
CREATE TABLE IF NOT EXISTS public.ot_approval_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  threshold_name text NOT NULL,
  daily_limit_hours numeric DEFAULT 4,
  weekly_limit_hours numeric DEFAULT 20,
  monthly_limit_hours numeric DEFAULT 80,
  max_claimable_amount numeric DEFAULT 1000,
  auto_block_enabled boolean DEFAULT false,
  alert_recipients uuid[] DEFAULT '{}',
  applies_to_department_ids uuid[] DEFAULT '{}',
  applies_to_role_ids text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Insert default threshold (only if empty)
INSERT INTO public.ot_approval_thresholds(
  threshold_name, 
  daily_limit_hours, 
  weekly_limit_hours, 
  monthly_limit_hours, 
  max_claimable_amount, 
  auto_block_enabled
) SELECT 'Standard Thresholds', 4, 20, 80, 1000, false
WHERE NOT EXISTS (SELECT 1 FROM public.ot_approval_thresholds);

-- Create ot_requests table
CREATE TABLE IF NOT EXISTS public.ot_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  total_hours numeric(4,2) NOT NULL,
  day_type day_type NOT NULL,
  reason text NOT NULL,
  attachment_url text,
  orp numeric(10,2),
  hrp numeric(10,2),
  ot_amount numeric(10,2),
  status ot_status DEFAULT 'pending_verification',
  supervisor_id uuid REFERENCES public.profiles(id),
  supervisor_verified_at timestamptz,
  supervisor_remarks text,
  hr_id uuid REFERENCES public.profiles(id),
  hr_approved_at timestamptz,
  hr_remarks text,
  bod_reviewed_at timestamptz,
  bod_remarks text,
  eligibility_rule_id uuid,
  formula_id uuid,
  threshold_violations jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);