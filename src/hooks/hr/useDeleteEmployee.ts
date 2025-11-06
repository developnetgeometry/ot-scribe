import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      const { data, error } = await supabase.functions.invoke('delete-employee', {
        body: { employeeId },
      });

      if (error) {
        const message = (error as any)?.message || (error as any)?.error || 'Failed to delete employee';
        
        if ((error as any)?.status === 401) {
          throw new Error('Your session expired or is invalid. Please sign in again.');
        }
        
        if ((error as any)?.status === 403) {
          throw new Error('You do not have permission to delete employees.');
        }
        
        throw new Error(message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees'] });
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
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
