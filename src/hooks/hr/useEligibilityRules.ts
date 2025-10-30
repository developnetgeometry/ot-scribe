import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEligibilityRules() {
  return useQuery({
    queryKey: ['eligibility-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ot_eligibility_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
