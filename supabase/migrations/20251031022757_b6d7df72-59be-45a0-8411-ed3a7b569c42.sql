-- Create holiday_calendars table
CREATE TABLE public.holiday_calendars (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  year int4 NOT NULL,
  state_code text,
  date_from date NOT NULL,
  date_to date NOT NULL,
  total_holidays int4 DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create holiday_calendar_items table
CREATE TABLE public.holiday_calendar_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_id uuid NOT NULL REFERENCES public.holiday_calendars(id) ON DELETE CASCADE,
  holiday_date date NOT NULL,
  description text NOT NULL,
  state_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create unique index for holiday_calendar_items
CREATE UNIQUE INDEX holiday_calendar_items_unique_idx 
ON public.holiday_calendar_items(calendar_id, holiday_date, COALESCE(state_code, '-'), description);

-- Add active_calendar_id to ot_settings
ALTER TABLE public.ot_settings 
ADD COLUMN active_calendar_id uuid REFERENCES public.holiday_calendars(id);

-- Enable RLS
ALTER TABLE public.holiday_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holiday_calendar_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for holiday_calendars
CREATE POLICY "hc_read_hr_admin" 
ON public.holiday_calendars 
FOR SELECT 
USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "hc_write_hr_admin" 
ON public.holiday_calendars 
FOR ALL 
USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for holiday_calendar_items
CREATE POLICY "hci_read_hr_admin" 
ON public.holiday_calendar_items 
FOR SELECT 
USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "hci_write_hr_admin" 
ON public.holiday_calendar_items 
FOR ALL 
USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Function to generate Malaysia state holidays
CREATE OR REPLACE FUNCTION public.generate_state_holidays(
  in_year int4,
  in_state_code text DEFAULT 'ALL'
)
RETURNS TABLE(
  holiday_date date,
  description text,
  state_code text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Malaysia National Holidays (approximate - adjust annually)
  RETURN QUERY
  SELECT 
    make_date(in_year, 1, 1)::date,
    'New Year''s Day'::text,
    'ALL'::text
  WHERE in_state_code = 'ALL' OR in_state_code IS NULL
  
  UNION ALL
  SELECT make_date(in_year, 2, 1)::date, 'Federal Territory Day'::text, 'WPKL'::text
  WHERE in_state_code IN ('ALL', 'WPKL', 'WPPJ', 'WPLB')
  
  UNION ALL
  SELECT make_date(in_year, 5, 1)::date, 'Labour Day'::text, 'ALL'::text
  WHERE in_state_code = 'ALL' OR in_state_code IS NULL
  
  UNION ALL
  SELECT make_date(in_year, 6, 3)::date, 'Birthday of His Majesty the Yang di-Pertuan Agong'::text, 'ALL'::text
  WHERE in_state_code = 'ALL' OR in_state_code IS NULL
  
  UNION ALL
  SELECT make_date(in_year, 8, 31)::date, 'National Day'::text, 'ALL'::text
  WHERE in_state_code = 'ALL' OR in_state_code IS NULL
  
  UNION ALL
  SELECT make_date(in_year, 9, 16)::date, 'Malaysia Day'::text, 'ALL'::text
  WHERE in_state_code = 'ALL' OR in_state_code IS NULL
  
  UNION ALL
  SELECT make_date(in_year, 12, 25)::date, 'Christmas Day'::text, 'ALL'::text
  WHERE in_state_code = 'ALL' OR in_state_code IS NULL;
  
  -- Note: Add more state-specific holidays as needed
  -- Religious holidays (Hari Raya, Deepavali, Chinese New Year) vary by year
END;
$$;