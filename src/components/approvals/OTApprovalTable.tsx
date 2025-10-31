import { useState } from 'react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { GroupedOTRequest } from '@/types/otms';
import { formatTime12Hour, formatHours } from '@/lib/otCalculations';
import { OTApprovalDetailsSheet } from './OTApprovalDetailsSheet';
import { Badge } from '@/components/ui/badge';

type ApprovalRole = 'supervisor' | 'hr' | 'bod';

interface OTApprovalTableProps {
  requests: GroupedOTRequest[];
  isLoading: boolean;
  role: ApprovalRole;
}

export function OTApprovalTable({ requests, isLoading, role }: OTApprovalTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<GroupedOTRequest | null>(null);

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
              <TableHead>Details</TableHead>
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRequest(request)}
                    >
                      View Details
                    </Button>
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
    </>
  );
}
