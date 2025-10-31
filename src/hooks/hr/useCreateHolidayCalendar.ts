import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HolidayItem {
  holiday_date: string;
  description: string;
  state_code?: string | null;
}

interface CreateHolidayCalendarData {
  name: string;
  year: number;
  state_code?: string | null;
  date_from: string;
  date_to: string;
  total_holidays: number;
  items: HolidayItem[];
}

export function useCreateHolidayCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHolidayCalendarData) => {
      const { items, ...calendarData } = data;

      // Insert calendar
      const { data: calendar, error: calendarError } = await supabase
        .from('holiday_calendars')
        .insert(calendarData)
        .select()
        .single();

      if (calendarError) throw calendarError;

      // Insert items
      if (items.length > 0) {
        const itemsWithCalendarId = items.map(item => ({
          ...item,
          calendar_id: calendar.id,
        }));

        const { error: itemsError } = await supabase
          .from('holiday_calendar_items')
          .insert(itemsWithCalendarId);

        if (itemsError) throw itemsError;
      }

      return calendar;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holiday-calendars'] });
      toast.success('Holiday calendar created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create holiday calendar: ' + error.message);
    },
  });
}
