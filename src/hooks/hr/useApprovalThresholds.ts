import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useApprovalThresholds() {
  return useQuery({
    queryKey: ['approval-thresholds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ot_approval_thresholds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
