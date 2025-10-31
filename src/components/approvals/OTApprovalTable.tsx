import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { GroupedOTRequest } from '@/types/otms';
import { formatTime12Hour, formatHours } from '@/lib/otCalculations';
import { OTApprovalDetailsSheet } from './OTApprovalDetailsSheet';
import { RejectOTModal } from './RejectOTModal';
import { Badge } from '@/components/ui/badge';
import { useOTApproval } from '@/hooks/useOTApproval';

type ApprovalRole = 'supervisor' | 'hr' | 'bod';

interface OTApprovalTableProps {
  requests: GroupedOTRequest[];
  isLoading: boolean;
  role: ApprovalRole;
}

export function OTApprovalTable({ requests, isLoading, role }: OTApprovalTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<GroupedOTRequest | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<GroupedOTRequest | null>(null);
  const { approveRequest, rejectRequest, isApproving, isRejecting } = useOTApproval({ role });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No OT requests found
      </div>
    );
  }

  const handleApprove = async (request: GroupedOTRequest) => {
    try {
      await approveRequest({ requestIds: request.request_ids });
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectClick = (request: GroupedOTRequest) => {
    setRequestToReject(request);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (remarks: string) => {
    if (!requestToReject) return;
    try {
      await rejectRequest({ requestIds: requestToReject.request_ids, remarks });
      setRejectModalOpen(false);
      setRequestToReject(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getActionButtonLabel = (role: ApprovalRole): string => {
    switch (role) {
      case 'supervisor':
        return 'Verify';
      case 'hr':
        return 'Approve';
      case 'bod':
        return 'Review';
      default:
        return 'Approve';
    }
  };

  const canTakeAction = (request: GroupedOTRequest): boolean => {
    switch (role) {
      case 'supervisor':
        return request.status === 'pending_verification';
      case 'hr':
        return request.status === 'pending_verification' || request.status === 'verified';
      case 'bod':
        return request.status === 'approved';
      default:
        return false;
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Submitted OT Sessions</TableHead>
              <TableHead>Total OT Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const profile = (request as any).profiles;
              return (
                <TableRow key={request.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div 
                      className="font-semibold cursor-pointer hover:underline"
                      onClick={() => setSelectedRequest(request)}
                    >
                      {profile?.full_name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {profile?.employee_id || request.employee_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(request.ot_date), 'dd MMM yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {request.sessions.map((session, idx) => (
                        <div key={idx} className="text-sm">
                          {formatTime12Hour(session.start_time)} - {formatTime12Hour(session.end_time)}
                          <span className="text-muted-foreground ml-2">
                            ({formatHours(session.total_hours)} hrs)
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-primary">
                      {formatHours(request.total_hours)} hours
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={request.status} />
                      {request.threshold_violations && Object.keys(request.threshold_violations).length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          Violation
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {canTakeAction(request) && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request)}
                          disabled={isApproving || isRejecting}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {getActionButtonLabel(role)}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(request)}
                          disabled={isApproving || isRejecting}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OTApprovalDetailsSheet
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        role={role}
      />

      <RejectOTModal
        request={requestToReject}
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        onConfirm={handleRejectConfirm}
        isLoading={isRejecting}
      />
    </>
  );
}
