import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdatePositionData {
  id: string;
  department_id: string;
  title?: string;
  description?: string | null;
  is_active?: boolean;
}

export function useUpdatePosition() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePositionData) => {
      const { id, department_id, ...updateData } = data;
      
      const payload: any = {};
      if (updateData.title !== undefined) payload.title = updateData.title.trim();
      if (updateData.description !== undefined) payload.description = updateData.description?.trim() || null;
      if (updateData.is_active !== undefined) payload.is_active = updateData.is_active;

      const { data: result, error } = await supabase
        .from('positions')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('A position with this title already exists in this department');
        }
        throw error;
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['positions', variables.department_id] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'Success',
        description: 'Position updated successfully',
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
