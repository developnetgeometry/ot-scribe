import { useState } from 'react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { OTRequest } from '@/types/otms';
import { formatCurrency, formatHours } from '@/lib/otCalculations';
import { StatusBadge } from '@/components/StatusBadge';
import { useOTApprovalAction } from '@/hooks/hr/useOTApprovals';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle } from 'lucide-react';

interface OTApprovalDetailsSheetProps {
  request: OTRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OTApprovalDetailsSheet({ request, open, onOpenChange }: OTApprovalDetailsSheetProps) {
  const [remarks, setRemarks] = useState('');
  const { approveRequest, rejectRequest } = useOTApprovalAction();

  if (!request) return null;

  const handleApprove = async () => {
    await approveRequest.mutateAsync({ requestId: request.id, remarks });
    onOpenChange(false);
    setRemarks('');
  };

  const handleReject = async () => {
    await rejectRequest.mutateAsync({ requestId: request.id, remarks });
    onOpenChange(false);
    setRemarks('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>OT Request Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Request ID</Label>
                <p className="font-mono text-sm">{request.id.slice(0, 8)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <StatusBadge status={request.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">OT Date</Label>
                <p>{format(new Date(request.ot_date), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Day Type</Label>
                <p className="capitalize">{request.day_type.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Start Time</Label>
                <p>{request.start_time}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">End Time</Label>
                <p>{request.end_time}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Total Hours</Label>
                <p className="font-semibold">{formatHours(request.total_hours)} hrs</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Calculation Details */}
          <div className="space-y-3">
            <h3 className="font-semibold">Calculation Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">ORP</Label>
                <p>{formatCurrency(request.orp || 0)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">HRP</Label>
                <p>{formatCurrency(request.hrp || 0)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">OT Amount</Label>
                <p className="font-semibold text-lg">{formatCurrency(request.ot_amount || 0)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div>
            <Label className="text-muted-foreground">Reason</Label>
            <p className="mt-1">{request.reason}</p>
          </div>

          {/* Supervisor Remarks */}
          {request.supervisor_remarks && (
            <>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Supervisor Remarks</Label>
                <p className="mt-1">{request.supervisor_remarks}</p>
                {request.supervisor_verified_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Verified on {format(new Date(request.supervisor_verified_at), 'dd MMM yyyy HH:mm')}
                  </p>
                )}
              </div>
            </>
          )}

          {/* HR Remarks */}
          {request.hr_remarks && (
            <>
              <Separator />
              <div>
                <Label className="text-muted-foreground">HR Remarks</Label>
                <p className="mt-1">{request.hr_remarks}</p>
              </div>
            </>
          )}

          {/* Approval Actions */}
          {(request.status === 'pending_verification' || request.status === 'verified') && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <Label htmlFor="remarks">HR Remarks *</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter your remarks..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={!remarks.trim() || approveRequest.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={!remarks.trim() || rejectRequest.isPending}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
