import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useHolidayCalendars() {
  return useQuery({
    queryKey: ['holiday-calendars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holiday_calendars')
        .select('*')
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
