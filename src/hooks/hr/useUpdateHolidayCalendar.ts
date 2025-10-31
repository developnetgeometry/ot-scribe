import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HolidayItem {
  id?: string;
  holiday_date: string;
  description: string;
  state_code?: string | null;
}

interface UpdateHolidayCalendarData {
  id: string;
  name: string;
  year: number;
  state_code?: string | null;
  date_from: string;
  date_to: string;
  total_holidays: number;
  items: HolidayItem[];
  removedItemIds?: string[];
}

export function useUpdateHolidayCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateHolidayCalendarData) => {
      const { id, items, removedItemIds, ...calendarData } = data;

      // Update calendar
      const { error: calendarError } = await supabase
        .from('holiday_calendars')
        .update(calendarData)
        .eq('id', id);

      if (calendarError) throw calendarError;

      // Delete removed items
      if (removedItemIds && removedItemIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('holiday_calendar_items')
          .delete()
          .in('id', removedItemIds);

        if (deleteError) throw deleteError;
      }

      // Upsert items
      if (items.length > 0) {
        const itemsWithCalendarId = items.map(item => ({
          ...item,
          calendar_id: id,
        }));

        const { error: itemsError } = await supabase
          .from('holiday_calendar_items')
          .upsert(itemsWithCalendarId);

        if (itemsError) throw itemsError;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holiday-calendars'] });
      queryClient.invalidateQueries({ queryKey: ['holiday-calendar'] });
      toast.success('Holiday calendar updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update holiday calendar: ' + error.message);
    },
  });
}
