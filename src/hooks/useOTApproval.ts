import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OTRequest, OTStatus, AppRole, GroupedOTRequest } from '@/types/otms';
import { toast } from 'sonner';

type ApprovalRole = 'supervisor' | 'hr' | 'bod';

interface UseOTApprovalOptions {
  role: ApprovalRole;
  status?: string;
}

interface ApprovalAction {
  requestIds: string[];
  remarks?: string;
}

// Helper function to group OT requests by employee and date
function groupOTRequestsByEmployee(requests: any[]): GroupedOTRequest[] {
  const grouped = new Map<string, any>();
  
  requests.forEach(request => {
    const key = `${request.employee_id}_${request.ot_date}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, {
        ...request,
        profiles: request.profiles, // Explicitly preserve profiles
        sessions: [],
        total_hours: 0,
        request_ids: [],
        start_time: '',
        end_time: '',
      });
    }
    
    const group = grouped.get(key)!;
    group.sessions.push({
      id: request.id,
      start_time: request.start_time,
      end_time: request.end_time,
      total_hours: request.total_hours,
    });
    group.total_hours += request.total_hours;
    group.request_ids.push(request.id);
    
    // Accumulate OT amounts
    if (request.ot_amount) {
      group.ot_amount = (group.ot_amount || 0) + request.ot_amount;
    }
  });
  
  return Array.from(grouped.values());
}

// Group requests by date for date-grouped card view
export interface DateGroup {
  date: string;
  requests: GroupedOTRequest[];
}

function convertToDateGroups(requests: GroupedOTRequest[]): DateGroup[] {
  const dateMap = new Map<string, GroupedOTRequest[]>();
  
  requests.forEach(request => {
    const date = request.ot_date;
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }
    dateMap.get(date)!.push(request);
  });
  
  // Convert to array and sort by date (newest first)
  return Array.from(dateMap.entries())
    .map(([date, requests]) => ({ date, requests }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Map roles to their respective status filters
const getStatusFilter = (role: ApprovalRole, statusFilter?: string): OTStatus[] => {
  if (statusFilter && statusFilter !== 'all') {
    // Handle "completed" as a special case that includes multiple statuses
    if (statusFilter === 'completed') {
      return ['supervisor_verified', 'hr_certified', 'bod_approved'];
    }
    return [statusFilter as OTStatus];
  }

  // Handle "all" case specifically for each role
  if (statusFilter === 'all') {
    if (role === 'supervisor') {
      return ['pending_verification', 'supervisor_verified', 'hr_certified', 'bod_approved', 'rejected'];
    }
    if (role === 'hr') {
      return ['pending_verification', 'supervisor_verified', 'rejected'];
    }
    if (role === 'bod') {
      return ['hr_certified', 'bod_approved', 'rejected'];
    }
  }

  switch (role) {
    case 'supervisor':
      return ['pending_verification'];
    case 'hr':
      return ['pending_verification', 'supervisor_verified'];
    case 'bod':
      return ['hr_certified'];
    default:
      return [];
  }
};

// Map roles to their next status after approval
const getApprovedStatus = (role: ApprovalRole): OTStatus => {
  switch (role) {
    case 'supervisor':
      return 'supervisor_verified';
    case 'hr':
      return 'hr_certified';
    case 'bod':
      return 'bod_approved';
    default:
      return 'hr_certified';
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
        // Use .in() for multi-status filters ('completed', 'all' for supervisor)
        if (status === 'completed' || (status === 'all' && role === 'supervisor')) {
          query = query.in('status', statuses);
        } else if (status && status !== 'all') {
          // Single status filter
          query = query.eq('status', status as OTStatus);
        } else {
          // Fallback for other 'all' cases
          query = query.in('status', statuses);
        }
      }

      // Apply role-specific filters
      if (role === 'supervisor') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // First, get employee IDs that this supervisor manages
          const { data: employees } = await supabase
            .from('profiles')
            .select('id')
            .eq('supervisor_id', user.id);
          
          if (employees && employees.length > 0) {
            const employeeIds = employees.map(e => e.id);
            query = query.in('employee_id', employeeIds);
          } else {
            // No employees found, return empty result
            query = query.eq('employee_id', '00000000-0000-0000-0000-000000000000');
          }
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as OTRequest[];
    },
  });

  // Approve mutation - now supports batch operations
  const approveMutation = useMutation({
    mutationFn: async ({ requestIds, remarks }: ApprovalAction) => {
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

      // Batch update all request IDs
      const { error } = await supabase
        .from('ot_requests')
        .update(updateData)
        .in('id', requestIds);

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

  // Reject mutation - now supports batch operations with rejection stage
  const rejectMutation = useMutation({
    mutationFn: async ({ requestIds, remarks, rejectionStage }: ApprovalAction & { rejectionStage?: string }) => {
      if (!remarks || remarks.trim() === '') {
        throw new Error('Remarks are required when rejecting a request');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // BOD rejection goes to HR recertification instead of final rejection
      const status = role === 'bod' ? 'pending_hr_recertification' : 'rejected';

      const updateData: any = {
        status: status,
        [getRemarksField(role)]: remarks,
        [getTimestampField(role)]: new Date().toISOString(),
        rejection_stage: rejectionStage || role,
      };

      // Add ID field if applicable
      const idField = getIdField(role);
      if (idField) {
        updateData[idField] = user.id;
      }

      // Batch update all request IDs
      const { error } = await supabase
        .from('ot_requests')
        .update(updateData)
        .in('id', requestIds);

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

  const groupedRequests = groupOTRequestsByEmployee(data || []);

  return {
    requests: groupedRequests,
    dateGroupedRequests: convertToDateGroups(groupedRequests),
    isLoading,
    error,
    approveRequest: approveMutation.mutateAsync,
    rejectRequest: rejectMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
