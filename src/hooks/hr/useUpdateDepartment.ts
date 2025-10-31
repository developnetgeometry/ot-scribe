import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpdateDepartmentData {
  id: string;
  code: string;
  name: string;
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, code, name }: UpdateDepartmentData) => {
      const { data, error } = await supabase
        .from('departments')
        .update({
          code: code.toUpperCase(),
          name: name.trim(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Department code or name already exists');
      } else {
        toast.error('Failed to update department');
      }
    },
  });
}
