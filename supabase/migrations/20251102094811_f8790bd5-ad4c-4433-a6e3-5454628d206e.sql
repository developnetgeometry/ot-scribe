-- Fix RLS policies to allow all authenticated users to view calendar data
-- while keeping write operations restricted to HR/admin only

-- Update holiday_calendars table policies
DROP POLICY IF EXISTS "hc_read_hr_admin" ON public.holiday_calendars;

CREATE POLICY "hc_read_all_users" 
ON public.holiday_calendars 
FOR SELECT 
TO authenticated 
USING (true);

-- Update holiday_calendar_items table policies
DROP POLICY IF EXISTS "hci_read_hr_admin" ON public.holiday_calendar_items;

CREATE POLICY "hci_read_all_users" 
ON public.holiday_calendar_items 
FOR SELECT 
TO authenticated 
USING (true);

-- Note: Write policies (hc_write_hr_admin and hci_write_hr_admin) remain unchanged
-- Only HR and Admin can create, update, or delete calendar data