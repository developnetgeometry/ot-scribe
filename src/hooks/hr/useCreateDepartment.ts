import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateDepartmentData {
  code: string;
  name: string;
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDepartmentData) => {
      const { data: department, error } = await supabase
        .from('departments')
        .insert({
          code: data.code.toUpperCase(),
          name: data.name.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Department code or name already exists');
      } else {
        toast.error('Failed to create department');
      }
    },
  });
}
