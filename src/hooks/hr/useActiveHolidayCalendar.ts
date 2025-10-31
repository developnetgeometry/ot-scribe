import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useActiveHolidayCalendar() {
  return useQuery({
    queryKey: ['active-holiday-calendar'],
    queryFn: async () => {
      // Get the most recent calendar by year and created_at
      const { data: calendar, error: calendarError } = await supabase
        .from('holiday_calendars')
        .select('*')
        .order('year', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (calendarError) throw calendarError;
      if (!calendar) return null;

      // Get all items for this calendar
      const { data: items, error: itemsError } = await supabase
        .from('holiday_calendar_items')
        .select('*')
        .eq('calendar_id', calendar.id)
        .order('holiday_date', { ascending: true });

      if (itemsError) throw itemsError;

      return { ...calendar, items: items || [] };
    },
  });
}
