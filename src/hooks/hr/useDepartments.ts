import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DepartmentWithCount {
  id: string;
  code: string;
  name: string;
  created_at: string;
  employee_count: number;
  position_count: number;
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          profiles!profiles_department_id_fkey(count),
          positions(count)
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      // Transform the data to include employee_count and position_count
      const departmentsWithCount: DepartmentWithCount[] = data.map((dept: any) => ({
        id: dept.id,
        code: dept.code,
        name: dept.name,
        created_at: dept.created_at,
        employee_count: dept.profiles?.[0]?.count || 0,
        position_count: dept.positions?.[0]?.count || 0,
      }));

      return departmentsWithCount;
    },
  });
}
