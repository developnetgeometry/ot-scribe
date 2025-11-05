import { useState } from 'react';
import { GroupedOTRequest } from '@/types/otms';
import { DateGroupHeader } from './DateGroupHeader';
import { OTRequestCard } from './OTRequestCard';
import { OTApprovalDetailsSheet } from '@/components/approvals/OTApprovalDetailsSheet';
import { RejectOTModal } from '@/components/approvals/RejectOTModal';

interface DateGroup {
  date: string;
  requests: GroupedOTRequest[];
}

interface DateGroupedOTApprovalViewProps {
  dateGroups: DateGroup[];
  isLoading: boolean;
  approveRequest?: (requestIds: string[], remarks?: string) => Promise<void>;
  rejectRequest?: (requestIds: string[], remarks: string) => Promise<void>;
  isApproving?: boolean;
  isRejecting?: boolean;
  showActions?: boolean;
}

export function DateGroupedOTApprovalView({
  dateGroups,
  isLoading,
  approveRequest,
  rejectRequest,
  isApproving,
  isRejecting,
  showActions = true
}: DateGroupedOTApprovalViewProps) {
  const [selectedRequest, setSelectedRequest] = useState<GroupedOTRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<GroupedOTRequest | null>(null);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);

  const handleApprove = async (request: GroupedOTRequest) => {
    if (!approveRequest) return;
    setApprovingRequestId(request.id);
    try {
      await approveRequest(request.request_ids);
    } finally {
      setApprovingRequestId(null);
    }
  };

  const handleRejectConfirm = async (remarks: string) => {
    if (!rejectRequest || !rejectingRequest) return;
    try {
      await rejectRequest(rejectingRequest.request_ids, remarks);
      setRejectingRequest(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (dateGroups.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No OT requests found
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {dateGroups.map((group) => (
          <div key={group.date}>
            <DateGroupHeader 
              date={group.date} 
              requestCount={group.requests.length} 
            />
            
            {group.requests.map((request) => (
              <OTRequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request)}
                onReject={() => setRejectingRequest(request)}
                onViewDetails={() => setSelectedRequest(request)}
                isApproving={approvingRequestId === request.id}
                isRejecting={isRejecting}
                showActions={showActions}
              />
            ))}
          </div>
        ))}
      </div>

      <OTApprovalDetailsSheet
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        role="hr"
      />

      <RejectOTModal
        request={rejectingRequest}
        open={!!rejectingRequest}
        onOpenChange={(open) => !open && setRejectingRequest(null)}
        onConfirm={handleRejectConfirm}
        isLoading={isRejecting}
      />
    </>
  );
}
