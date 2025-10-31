import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GenerateStateHolidaysParams {
  year: number;
  stateCode: string;
}

export function useGenerateStateHolidays() {
  return useMutation({
    mutationFn: async ({ year, stateCode }: GenerateStateHolidaysParams) => {
      const { data, error } = await supabase.rpc('generate_state_holidays', {
        in_year: year,
        in_state_code: stateCode,
      });

      if (error) throw error;
      return data as Array<{ holiday_date: string; description: string; state_code: string }>;
    },
    onError: (error: Error) => {
      toast.error('Failed to generate state holidays: ' + error.message);
    },
  });
}
