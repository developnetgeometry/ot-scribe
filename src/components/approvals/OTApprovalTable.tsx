import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { OTRequest } from '@/types/otms';
import { formatCurrency, formatHours } from '@/lib/otCalculations';
import { OTApprovalDetailsSheet } from './OTApprovalDetailsSheet';
import { Badge } from '@/components/ui/badge';

type ApprovalRole = 'supervisor' | 'hr' | 'bod';

interface OTApprovalTableProps {
  requests: OTRequest[];
  isLoading: boolean;
  role: ApprovalRole;
}

export function OTApprovalTable({ requests, isLoading, role }: OTApprovalTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<OTRequest | null>(null);

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

  const getDayTypeBadge = (dayType: string) => {
    const variants: Record<string, string> = {
      weekday: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      saturday: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      sunday: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      public_holiday: 'bg-red-500/10 text-red-600 dark:text-red-400',
    };
    
    return (
      <Badge variant="outline" className={variants[dayType]}>
        {dayType.replace('_', ' ')}
      </Badge>
    );
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

  const canTakeAction = (request: OTRequest): boolean => {
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
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>OT Date</TableHead>
              <TableHead>Day Type</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const profile = (request as any).profiles;
              return (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{profile?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{profile?.employee_id || request.employee_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{(profile?.departments as any)?.name || '-'}</div>
                  </TableCell>
                  <TableCell>{format(new Date(request.ot_date), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{getDayTypeBadge(request.day_type)}</TableCell>
                  <TableCell>{formatHours(request.total_hours)} hrs</TableCell>
                  <TableCell>{formatCurrency(request.ot_amount || 0)}</TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                    {request.threshold_violations && Object.keys(request.threshold_violations).length > 0 && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Violation
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {canTakeAction(request) && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {getActionButtonLabel(role)}
                        </Button>
                      )}
                    </div>
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
