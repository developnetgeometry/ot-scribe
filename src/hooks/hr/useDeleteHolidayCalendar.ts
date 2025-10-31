import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDeleteHolidayCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('holiday_calendars')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holiday-calendars'] });
      toast.success('Holiday calendar deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete holiday calendar: ' + error.message);
    },
  });
}
