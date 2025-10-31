import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePositionData {
  department_id: string;
  title: string;
  description?: string | null;
  is_active?: boolean;
}

export function useCreatePosition() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePositionData) => {
      const { data: result, error } = await supabase
        .from('positions')
        .insert({
          department_id: data.department_id,
          title: data.title.trim(),
          description: data.description?.trim() || null,
          is_active: data.is_active ?? true,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
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
        description: 'Position created successfully',
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
