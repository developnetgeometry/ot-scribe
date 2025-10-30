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
        title: '✅ Employee Invited Successfully!',
        description: 'Temporary Password: Temp@12345 — Please share this password with the new employee. They must change it on first login.',
        duration: 10000,
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
