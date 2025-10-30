import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/otms';

export function useEmployees() {
  return useQuery({
    queryKey: ['hr-employees'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch departments
      const { data: departments, error: departmentsError } = await supabase
        .from('departments')
        .select('id, name, code');

      if (departmentsError) throw departmentsError;

      // Merge roles and departments into profiles
      const profilesWithData = profiles?.map(profile => {
        const userRoles = roles?.filter(r => r.user_id === profile.id);
        const department = departments?.find(d => d.id === profile.department_id);
        return {
          ...profile,
          user_roles: userRoles?.map(r => ({ role: r.role })) || [],
          department: department || null
        };
      });

      return profilesWithData as Profile[];
    },
  });
}
