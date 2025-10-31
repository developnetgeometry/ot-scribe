import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useHolidayCalendar(id: string | undefined) {
  return useQuery({
    queryKey: ['holiday-calendar', id],
    queryFn: async () => {
      if (!id) throw new Error('Calendar ID is required');

      const { data: calendar, error: calendarError } = await supabase
        .from('holiday_calendars')
        .select('*')
        .eq('id', id)
        .single();

      if (calendarError) throw calendarError;

      const { data: items, error: itemsError } = await supabase
        .from('holiday_calendar_items')
        .select('*')
        .eq('calendar_id', id)
        .order('holiday_date', { ascending: true });

      if (itemsError) throw itemsError;

      return { ...calendar, items: items || [] };
    },
    enabled: !!id,
  });
}
