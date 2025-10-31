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
      console.log('Creating department with data:', data);
      
      const { data: department, error } = await supabase
        .from('departments')
        .insert({
          code: data.code.toUpperCase(),
          name: data.name.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error('Department creation error:', error);
        throw error;
      }
      return department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
    },
    onError: (error: any) => {
      console.error('Department creation failed:', error);
      
      if (error.code === '23505') {
        toast.error('Department code or name already exists');
      } else if (error.code === '42501') {
        toast.error('Insufficient permissions to create department');
      } else if (error.code === '23514') {
        toast.error('Department data does not meet requirements');
      } else if (error.message) {
        toast.error(`Failed to create department: ${error.message}`);
      } else {
        toast.error('Failed to create department');
      }
    },
  });
}
