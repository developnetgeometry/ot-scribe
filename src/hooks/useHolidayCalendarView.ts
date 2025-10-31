import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HolidayItem {
  id: string;
  holiday_date: string;
  description: string;
  state_code?: string | null;
}

export function useHolidayCalendarView() {
  return useQuery({
    queryKey: ['holiday-calendar-view'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holiday_calendar_items')
        .select('*')
        .order('holiday_date', { ascending: true });

      if (error) throw error;
      return data as HolidayItem[];
    },
  });
}
