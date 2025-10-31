import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateRateFormulaData {
  formula_name: string;
  day_type: 'weekday' | 'saturday' | 'sunday' | 'public_holiday';
  multiplier: number;
  base_formula: string;
  is_active?: boolean;
  effective_from: string;
  effective_to?: string | null;
  employee_category?: string;
  conditional_logic?: any;
}

export function useCreateRateFormula() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRateFormulaData) => {
      const { error } = await supabase
        .from('ot_rate_formulas')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-formulas'] });
      toast({
        title: 'Success',
        description: 'Rate formula created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create rate formula: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}
