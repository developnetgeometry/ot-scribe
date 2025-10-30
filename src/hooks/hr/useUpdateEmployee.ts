import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Profile, AppRole } from '@/types/otms';

interface UpdateEmployeeData {
  id: string;
  full_name?: string;
  email?: string;
  department_id?: string | null;
  basic_salary?: number;
  employment_type?: string | null;
  designation?: string | null;
  position?: string | null;
  supervisor_id?: string | null;
  joining_date?: string | null;
  work_location?: string | null;
  state?: string | null;
  status?: string;
  role?: AppRole;
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEmployeeData) => {
      const { id, role, ...profileData } = data;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id);

      if (profileError) throw profileError;

      // Update role if provided
      if (role) {
        // Delete existing roles
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', id);

        if (deleteError) throw deleteError;

        // Insert new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: id, role });

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees'] });
      toast({
        title: 'Success',
        description: 'Employee updated successfully',
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
