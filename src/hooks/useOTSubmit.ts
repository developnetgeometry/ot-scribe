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
  attachment_urls: string[];
}

export function useOTSubmit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OTSubmitData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get employee profile to get supervisor_id and check OT eligibility
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('supervisor_id, is_ot_eligible')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Check if employee is eligible for OT
      if (!profile.is_ot_eligible) {
        throw new Error('You are not eligible to submit OT requests. Please contact HR.');
      }

      // Check for duplicate or overlapping OT requests
      const { data: existingRequests, error: checkError } = await supabase
        .from('ot_requests')
        .select('id, start_time, end_time, status')
        .eq('employee_id', user.id)
        .eq('ot_date', data.ot_date)
        .neq('status', 'rejected');

      if (checkError) throw checkError;

      if (existingRequests && existingRequests.length > 0) {
        // Check for time overlap
        for (const existing of existingRequests) {
          const existingStart = existing.start_time;
          const existingEnd = existing.end_time;
          const newStart = data.start_time;
          const newEnd = data.end_time;

          // Overlap occurs if: (newStart < existingEnd) AND (newEnd > existingStart)
          if (newStart < existingEnd && newEnd > existingStart) {
            throw new Error(
              `You already have an OT request for ${data.ot_date} from ${existingStart} to ${existingEnd}. ` +
              `Please cancel or modify the existing request before submitting a new one.`
            );
          }
        }
      }

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
          attachment_urls: data.attachment_urls,
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
