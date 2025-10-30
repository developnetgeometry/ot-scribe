import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OTSubmitData {
  ot_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  day_type: 'weekday' | 'saturday' | 'sunday' | 'public_holiday';
  reason: string;
  attachment_url?: string;
}

export function useOTSubmit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OTSubmitData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get employee profile to get supervisor_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('supervisor_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data: otRequest, error } = await supabase
        .from('ot_requests')
        .insert({
          employee_id: user.id,
          supervisor_id: profile.supervisor_id || null,
          ot_date: data.ot_date,
          start_time: data.start_time,
          end_time: data.end_time,
          total_hours: data.total_hours,
          day_type: data.day_type,
          reason: data.reason,
          attachment_url: data.attachment_url || null,
        })
        .select()
        .single();

      if (error) throw error;
      return otRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ot-requests'] });
      toast({
        title: 'Success',
        description: 'OT request submitted successfully',
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
