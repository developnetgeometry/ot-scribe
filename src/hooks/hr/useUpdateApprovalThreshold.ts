import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateApprovalThresholdData {
  id: string;
  threshold_name?: string;
  daily_limit_hours?: number;
  weekly_limit_hours?: number;
  monthly_limit_hours?: number;
  max_claimable_amount?: number;
  auto_block_enabled?: boolean;
  is_active?: boolean;
  applies_to_department_ids?: string[];
  applies_to_role_ids?: string[];
}

export function useUpdateApprovalThreshold() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateApprovalThresholdData) => {
      const { id, ...updateData } = data;
      
      const { error } = await supabase
        .from('ot_approval_thresholds')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-thresholds'] });
      toast({
        title: 'Success',
        description: 'Approval threshold updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update approval threshold: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}
