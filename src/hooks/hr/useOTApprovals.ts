import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OTRequest, OTStatus } from '@/types/otms';
import { useToast } from '@/hooks/use-toast';

interface UseOTApprovalsOptions {
  status?: string;
}

export function useOTApprovals(options: UseOTApprovalsOptions = {}) {
  return useQuery({
    queryKey: ['hr-ot-approvals', options],
    queryFn: async () => {
      let query = supabase
        .from('ot_requests')
        .select('*')
        .order('ot_date', { ascending: false });

      if (options.status) {
        if (options.status === 'all') {
          // Show only approved and rejected requests
          query = query.in('status', ['approved', 'rejected'] as OTStatus[]);
        } else if (options.status === 'verified') {
          // Show both pending_verification and verified for HR approval
          query = query.in('status', ['pending_verification', 'verified'] as OTStatus[]);
        } else {
          query = query.eq('status', options.status as OTStatus);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OTRequest[];
    },
  });
}

export function useOTApprovalAction() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveRequest = useMutation({
    mutationFn: async ({ requestId, remarks }: { requestId: string; remarks: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('ot_requests')
        .update({
          status: 'approved',
          hr_id: user.id,
          hr_approved_at: new Date().toISOString(),
          hr_remarks: remarks,
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-ot-approvals'] });
      toast({
        title: 'Success',
        description: 'OT request approved successfully',
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

  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, remarks }: { requestId: string; remarks: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('ot_requests')
        .update({
          status: 'rejected',
          hr_id: user.id,
          hr_remarks: remarks,
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-ot-approvals'] });
      toast({
        title: 'Success',
        description: 'OT request rejected',
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

  return { approveRequest, rejectRequest };
}
