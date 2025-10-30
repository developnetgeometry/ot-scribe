import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OTRequest, OTStatus, AppRole } from '@/types/otms';
import { toast } from 'sonner';

type ApprovalRole = 'supervisor' | 'hr' | 'bod';

interface UseOTApprovalOptions {
  role: ApprovalRole;
  status?: string;
}

interface ApprovalAction {
  requestId: string;
  remarks?: string;
}

// Map roles to their respective status filters
const getStatusFilter = (role: ApprovalRole, statusFilter?: string): OTStatus[] => {
  if (statusFilter && statusFilter !== 'all') {
    // Handle "completed" as a special case that includes multiple statuses
    if (statusFilter === 'completed') {
      return ['verified', 'approved', 'reviewed'];
    }
    return [statusFilter as OTStatus];
  }

  switch (role) {
    case 'supervisor':
      return ['pending_verification'];
    case 'hr':
      return ['pending_verification', 'verified'];
    case 'bod':
      return ['approved'];
    default:
      return [];
  }
};

// Map roles to their next status after approval
const getApprovedStatus = (role: ApprovalRole): OTStatus => {
  switch (role) {
    case 'supervisor':
      return 'verified';
    case 'hr':
      return 'approved';
    case 'bod':
      return 'reviewed';
    default:
      return 'approved';
  }
};

// Map roles to their remarks field names
const getRemarksField = (role: ApprovalRole): string => {
  switch (role) {
    case 'supervisor':
      return 'supervisor_remarks';
    case 'hr':
      return 'hr_remarks';
    case 'bod':
      return 'bod_remarks';
    default:
      return 'hr_remarks';
  }
};

// Map roles to their timestamp field names
const getTimestampField = (role: ApprovalRole): string => {
  switch (role) {
    case 'supervisor':
      return 'supervisor_verified_at';
    case 'hr':
      return 'hr_approved_at';
    case 'bod':
      return 'bod_reviewed_at';
    default:
      return 'hr_approved_at';
  }
};

// Map roles to their ID field names
const getIdField = (role: ApprovalRole): string | null => {
  switch (role) {
    case 'supervisor':
      return 'supervisor_id';
    case 'hr':
      return 'hr_id';
    case 'bod':
      return null; // BOD doesn't have a dedicated ID field
    default:
      return null;
  }
};

export function useOTApproval(options: UseOTApprovalOptions) {
  const queryClient = useQueryClient();
  const { role, status } = options;
  const queryKey = [`${role}-ot-approvals`, status];

  // Fetch OT requests based on role
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('ot_requests')
        .select(`
          *,
          profiles!ot_requests_employee_id_fkey(
            id,
            employee_id,
            full_name,
            department_id,
            basic_salary,
            departments(name)
          )
        `)
        .order('ot_date', { ascending: false });

      // Apply status filter
      const statuses = getStatusFilter(role, status);
      if (statuses.length > 0) {
        if (status && status !== 'all' && status !== 'completed') {
          query = query.eq('status', status as OTStatus);
        } else {
          query = query.in('status', statuses);
        }
      }

      // No role-specific filters - all roles can see all requests

      const { data, error } = await query;

      if (error) throw error;
      return data as OTRequest[];
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, remarks }: ApprovalAction) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {
        status: getApprovedStatus(role),
        [getRemarksField(role)]: remarks || null,
        [getTimestampField(role)]: new Date().toISOString(),
      };

      // Add ID field if applicable
      const idField = getIdField(role);
      if (idField) {
        updateData[idField] = user.id;
      }

      const { error } = await supabase
        .from('ot_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      const actionLabel = role === 'supervisor' ? 'verified' : role === 'hr' ? 'approved' : 'reviewed';
      toast.success(`OT request ${actionLabel} successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to approve request: ${error.message}`);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, remarks }: ApprovalAction) => {
      if (!remarks || remarks.trim() === '') {
        throw new Error('Remarks are required when rejecting a request');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {
        status: 'rejected',
        [getRemarksField(role)]: remarks,
        [getTimestampField(role)]: new Date().toISOString(),
      };

      // Add ID field if applicable
      const idField = getIdField(role);
      if (idField) {
        updateData[idField] = user.id;
      }

      const { error } = await supabase
        .from('ot_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('OT request rejected');
    },
    onError: (error) => {
      toast.error(`Failed to reject request: ${error.message}`);
    },
  });

  return {
    requests: data || [],
    isLoading,
    error,
    approveRequest: approveMutation.mutateAsync,
    rejectRequest: rejectMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
