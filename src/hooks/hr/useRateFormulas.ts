import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRateFormulas() {
  return useQuery({
    queryKey: ['rate-formulas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ot_rate_formulas')
        .select('*')
        .order('day_type', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}
