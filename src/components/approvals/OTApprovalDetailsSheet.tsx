import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/StatusBadge';
import { OTRequest } from '@/types/otms';
import { formatCurrency, formatHours } from '@/lib/otCalculations';
import { useOTApproval } from '@/hooks/useOTApproval';

type ApprovalRole = 'supervisor' | 'hr' | 'bod';

interface OTApprovalDetailsSheetProps {
  request: OTRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: ApprovalRole;
}

export function OTApprovalDetailsSheet({ request, open, onOpenChange, role }: OTApprovalDetailsSheetProps) {
  const [remarks, setRemarks] = useState('');
  const { approveRequest, rejectRequest, isApproving, isRejecting } = useOTApproval({ role });

  if (!request) return null;

  const profile = (request as any).profiles;

  const handleApprove = async () => {
    try {
      await approveRequest({ requestId: request.id, remarks });
      setRemarks('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      return;
    }
    try {
      await rejectRequest({ requestId: request.id, remarks });
      setRemarks('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getActionLabel = (role: ApprovalRole): { approve: string; reject: string } => {
    switch (role) {
      case 'supervisor':
        return { approve: 'Verify', reject: 'Reject Verification' };
      case 'hr':
        return { approve: 'Approve', reject: 'Reject Approval' };
      case 'bod':
        return { approve: 'Review', reject: 'Reject Review' };
      default:
        return { approve: 'Approve', reject: 'Reject' };
    }
  };

  const canTakeAction = (): boolean => {
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

  const actionLabels = getActionLabel(role);
  const hasThresholdViolations = request.threshold_violations && 
    Object.keys(request.threshold_violations).length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>OT Request Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Employee Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Employee Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{profile?.full_name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Employee ID</p>
                <p className="font-medium">{profile?.employee_id || request.employee_id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium">{(profile?.departments as any)?.name || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Basic Salary</p>
                <p className="font-medium">{formatCurrency(profile?.basic_salary || 0)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* OT Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">OT Details</h3>
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Date:</span>
              <span>{format(new Date(request.ot_date), 'dd MMM yyyy')}</span>
              <Badge variant="outline" className="ml-2">
                {request.day_type.replace('_', ' ')}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Time:</span>
              <span>{request.start_time} - {request.end_time}</span>
              <span className="ml-2">({formatHours(request.total_hours)} hours)</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Status:</span>
              <StatusBadge status={request.status} />
            </div>
          </div>

          {/* Calculation Details */}
          <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm">Calculation</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">ORP</p>
                <p className="font-medium">{formatCurrency(request.orp || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">HRP</p>
                <p className="font-medium">{formatCurrency(request.hrp || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">OT Amount</p>
                <p className="font-medium text-lg">{formatCurrency(request.ot_amount || 0)}</p>
              </div>
            </div>
          </div>

          {/* Threshold Violations */}
          {hasThresholdViolations && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">Threshold Violations Detected</p>
                <div className="text-sm space-y-1">
                  {request.threshold_violations.violations?.map((v: any, idx: number) => (
                    <div key={idx}>
                      • {v.type}: Exceeded by {v.exceeded_by} (Limit: {v.limit}, Current: {v.current})
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Reason</span>
            </div>
            <p className="text-sm bg-muted/50 p-3 rounded-md">{request.reason}</p>
          </div>

          {/* Audit Trail */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Audit Trail</h3>
            
            {request.supervisor_remarks && (
              <div className="bg-muted/50 p-3 rounded-md space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">Supervisor Verification</span>
                  {request.supervisor_verified_at && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(request.supervisor_verified_at), 'dd MMM yyyy HH:mm')}
                    </span>
                  )}
                </div>
                <p className="text-sm pl-6">{request.supervisor_remarks}</p>
              </div>
            )}

            {request.hr_remarks && (
              <div className="bg-muted/50 p-3 rounded-md space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">HR Approval</span>
                  {request.hr_approved_at && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(request.hr_approved_at), 'dd MMM yyyy HH:mm')}
                    </span>
                  )}
                </div>
                <p className="text-sm pl-6">{request.hr_remarks}</p>
              </div>
            )}

            {request.bod_remarks && (
              <div className="bg-muted/50 p-3 rounded-md space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-sm">BOD Review</span>
                  {request.bod_reviewed_at && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(request.bod_reviewed_at), 'dd MMM yyyy HH:mm')}
                    </span>
                  )}
                </div>
                <p className="text-sm pl-6">{request.bod_remarks}</p>
              </div>
            )}
          </div>

          {/* Attachment */}
          {request.attachment_url && (
            <div className="space-y-2">
              <span className="font-semibold">Attachment</span>
              <Button variant="outline" size="sm" asChild>
                <a href={request.attachment_url} target="_blank" rel="noopener noreferrer">
                  View Attachment
                </a>
              </Button>
            </div>
          )}

          {/* Approval Actions */}
          {canTakeAction() && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks (Optional for approval, Required for rejection)</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Add your remarks here..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  {/* Approve Button - Prominent */}
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting}
                    className="w-full"
                    size="lg"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {actionLabels.approve}
                  </Button>
                  
                  <Separator />
                  
                  {/* Reject Button - With warning */}
                  <div className="space-y-2">
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={isApproving || isRejecting || !remarks.trim()}
                      className="w-full"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {actionLabels.reject}
                    </Button>
                    
                    {!remarks.trim() && (
                      <p className="text-sm text-destructive text-center">
                        * Remarks are required to reject this request
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
