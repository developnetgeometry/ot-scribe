import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InviteEmployeeData {
  email: string;
  full_name: string;
  employee_id: string;
  ic_no: string | null;
  phone_no: string | null;
  position: string;
  position_id: string;
  department_id: string;
  company_id: string;
  basic_salary: number;
  epf_no: string | null;
  socso_no: string | null;
  income_tax_no: string | null;
  employment_type: string;
  joining_date: string;
  work_location: string;
  supervisor_id: string | null;
  role: 'employee' | 'supervisor' | 'hr' | 'management' | 'admin';
  is_ot_eligible: boolean;
}

export function useInviteEmployee() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteEmployeeData) => {
      const { data: result, error } = await supabase.functions.invoke('invite-employee', {
        body: data,
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees'] });
      toast({
        title: '✅ Employee Added Successfully!',
        description: 'Temporary Password: Temp@12345 — Please share this password with the new employee. They must change it on first login.',
        duration: 10000,
      });
    },
    onError: (error: any) => {
      console.error('Failed to invite employee:', error);
      
      let errorMessage = 'Failed to add employee';
      
      // Handle edge function errors
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}
