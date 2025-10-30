import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InviteEmployeeData {
  email: string;
  full_name: string;
  employee_id: string;
  basic_salary: number;
  employment_type: string;
  role: 'employee' | 'supervisor' | 'hr' | 'bod' | 'admin';
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
        title: 'Success',
        description: 'Employee added. Temporary password: Temp@12345. User must change password on first login.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
