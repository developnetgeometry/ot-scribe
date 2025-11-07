import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EvaluateFormulaParams {
  formula: string;
  basicSalary: number;
  hours: number;
  dayType: 'weekday' | 'saturday' | 'sunday' | 'public_holiday';
}

interface EvaluateFormulaResponse {
  success: boolean;
  orp?: number;
  hrp?: number;
  otAmount?: number;
  error?: string;
}

export function useEvaluateFormula() {
  return useMutation({
    mutationFn: async (params: EvaluateFormulaParams) => {
      const { data, error } = await supabase.functions.invoke<EvaluateFormulaResponse>(
        'evaluate-formula',
        {
          body: params,
        }
      );

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Formula evaluation failed');

      return data;
    },
  });
}
