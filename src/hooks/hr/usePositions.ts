import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Position {
  id: string;
  department_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  employee_count?: number;
}

export function usePositions(departmentId?: string) {
  return useQuery({
    queryKey: departmentId ? ['positions', departmentId] : ['positions'],
    queryFn: async () => {
      let query = supabase
        .from('positions')
        .select(`
          *,
          profiles!profiles_position_id_fkey(count)
        `)
        .order('title', { ascending: true });

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to include employee_count
      const positionsWithCount: Position[] = (data || []).map((pos: any) => ({
        id: pos.id,
        department_id: pos.department_id,
        title: pos.title,
        description: pos.description,
        is_active: pos.is_active,
        created_at: pos.created_at,
        updated_at: pos.updated_at,
        created_by: pos.created_by,
        employee_count: pos.profiles?.[0]?.count || 0,
      }));

      return positionsWithCount;
    },
  });
}
