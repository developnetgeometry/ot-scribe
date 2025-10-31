import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Profile, AppRole } from '@/types/otms';

interface UpdateEmployeeData {
  id: string;
  full_name?: string;
  email?: string;
  ic_no?: string | null;
  phone_no?: string | null;
  department_id?: string | null;
  basic_salary?: number;
  epf_no?: string | null;
  socso_no?: string | null;
  income_tax_no?: string | null;
  employment_type?: string | null;
  position?: string | null;
  supervisor_id?: string | null;
  joining_date?: string | null;
  work_location?: string | null;
  state?: string | null;
  status?: string;
  is_ot_eligible?: boolean;
  role?: AppRole;
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEmployeeData) => {
      const { id, role, ...profileData } = data;

      // Whitelist of valid profiles table columns
      const allowedColumns = [
        'full_name', 'email', 'ic_no', 'phone_no', 'department_id', 
        'basic_salary', 'epf_no', 'socso_no', 'income_tax_no', 
        'employment_type', 'position', 'supervisor_id', 'joining_date', 
        'work_location', 'state', 'status', 'is_ot_eligible', 
        'designation', 'position_id'
      ];

      // Nullable fields that should convert empty strings to null
      const nullableFields = [
        'ic_no', 'phone_no', 'department_id', 'epf_no', 'socso_no', 
        'income_tax_no', 'employment_type', 'position', 'supervisor_id', 
        'joining_date', 'work_location', 'state', 'position_id'
      ];

      // Sanitize the update payload
      const updateBody: Record<string, any> = {};
      Object.keys(profileData).forEach(key => {
        if (allowedColumns.includes(key)) {
          const value = profileData[key as keyof typeof profileData];
          // Convert empty strings to null for nullable fields
          if (nullableFields.includes(key) && value === '') {
            updateBody[key] = null;
          } else if (value !== undefined) {
            updateBody[key] = value;
          }
        }
      });

      // Update profile with sanitized data
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateBody)
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
