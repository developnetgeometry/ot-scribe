import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResubmitData {
  originalRequestId: string;
  ot_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  day_type: 'weekday' | 'saturday' | 'sunday' | 'public_holiday';
  reason: string;
  attachment_url?: string | null;
}

export function useOTResubmit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ResubmitData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get original request info
      const { data: originalRequest, error: fetchError } = await supabase
        .from('ot_requests')
        .select('resubmission_count, rejection_stage, supervisor_remarks, hr_remarks, management_remarks, supervisor_id')
        .eq('id', data.originalRequestId)
        .single();

      if (fetchError) throw fetchError;

      // Create new request as resubmission
      const { data: newRequest, error } = await supabase
        .from('ot_requests')
        .insert({
          employee_id: user.id,
          supervisor_id: originalRequest.supervisor_id,
          parent_request_id: data.originalRequestId,
          is_resubmission: true,
          resubmission_count: (originalRequest.resubmission_count || 0) + 1,
          ot_date: data.ot_date,
          start_time: data.start_time,
          end_time: data.end_time,
          total_hours: data.total_hours,
          day_type: data.day_type,
          reason: data.reason,
          attachment_url: data.attachment_url || null,
          status: 'pending_verification'
        })
        .select()
        .single();

      if (error) throw error;

      // Log resubmission history
      const rejectionReason = originalRequest.supervisor_remarks || 
                             originalRequest.hr_remarks || 
                             originalRequest.management_remarks || 
                             'No remarks provided';
      
      await supabase.from('ot_resubmission_history').insert([{
        original_request_id: data.originalRequestId,
        resubmitted_request_id: newRequest.id,
        rejected_by_role: (originalRequest.rejection_stage || 'supervisor') as 'employee' | 'supervisor' | 'hr' | 'management' | 'admin',
        rejection_reason: rejectionReason
      }]);

      return newRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ot-requests'] });
      toast({
        title: 'Success',
        description: 'OT request resubmitted successfully',
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
