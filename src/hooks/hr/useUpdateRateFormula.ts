import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateRateFormulaData {
  id: string;
  formula_name?: string;
  multiplier?: number;
  base_formula?: string;
  is_active?: boolean;
  effective_from?: string;
  effective_to?: string | null;
  conditional_logic?: any;
}

export function useUpdateRateFormula() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateRateFormulaData) => {
      const { id, ...updateData } = data;
      
      const { error } = await supabase
        .from('ot_rate_formulas')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-formulas'] });
      toast({
        title: 'Success',
        description: 'Rate formula updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update rate formula: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}
