import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateEligibilityRuleData {
  id: string;
  rule_name?: string;
  min_salary?: number;
  max_salary?: number;
  is_active?: boolean;
  department_ids?: string[];
  role_ids?: string[];
  employment_types?: string[];
}

export function useUpdateEligibilityRule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEligibilityRuleData) => {
      const { id, ...updateData } = data;
      
      const { error } = await supabase
        .from('ot_eligibility_rules')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibility-rules'] });
      toast({
        title: 'Success',
        description: 'Eligibility rule updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update eligibility rule: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}
