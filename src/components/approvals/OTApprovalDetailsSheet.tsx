import { format } from 'date-fns';
import { Calendar, Clock, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/StatusBadge';
import { GroupedOTRequest } from '@/types/otms';
import { formatCurrency, formatHours, formatTime12Hour } from '@/lib/otCalculations';

type ApprovalRole = 'supervisor' | 'hr' | 'bod';

interface OTApprovalDetailsSheetProps {
  request: GroupedOTRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: ApprovalRole;
}

export function OTApprovalDetailsSheet({ request, open, onOpenChange, role }: OTApprovalDetailsSheetProps) {
  if (!request) return null;

  const profile = (request as any).profiles;

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

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">OT Sessions:</span>
              </div>
              <div className="space-y-2 ml-6">
                {request.sessions.map((session, idx) => (
                  <div key={idx} className="text-sm bg-muted/50 p-2 rounded">
                    {formatTime12Hour(session.start_time)} - {formatTime12Hour(session.end_time)}
                    <span className="ml-2 text-muted-foreground">
                      ({formatHours(session.total_hours)} hours)
                    </span>
                  </div>
                ))}
                <div className="text-sm font-semibold pt-1 border-t border-border">
                  Total: {formatHours(request.total_hours)} hours
                </div>
              </div>
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
