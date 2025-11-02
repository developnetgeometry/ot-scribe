import { format } from 'date-fns';
import { ExternalLink, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/StatusBadge';
import { OTRequest } from '@/types/otms';
import { formatCurrency, formatHours, getDayTypeColor, getDayTypeLabel } from '@/lib/otCalculations';

interface OTDetailsSheetProps {
  request: OTRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OTDetailsSheet({ request, open, onOpenChange }: OTDetailsSheetProps) {
  if (!request) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>OT Request Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
            <StatusBadge status={request.status} />
          </div>

          <Separator />

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-base font-medium">{format(new Date(request.ot_date), 'PPP')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Day Type</p>
              <Badge className={getDayTypeColor(request.day_type)}>
                {getDayTypeLabel(request.day_type)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Start Time</p>
              <p className="text-base font-medium">{request.start_time}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">End Time</p>
              <p className="text-base font-medium">{request.end_time}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
              <p className="text-base font-medium">{formatHours(request.total_hours)} hrs</p>
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Reason</p>
            <p className="text-sm">{request.reason}</p>
          </div>

          {/* Attachment */}
          {request.attachment_url && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Attachment</p>
                <Button variant="outline" size="sm" asChild>
                  <a href={request.attachment_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    View Attachment
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </div>
            </>
          )}

          {/* Remarks */}
          {(request.supervisor_remarks || request.hr_remarks || request.bod_remarks) && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                {request.supervisor_remarks && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Supervisor</p>
                    <p className="text-sm">{request.supervisor_remarks}</p>
                  </div>
                )}
                {request.hr_remarks && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">HR</p>
                    <p className="text-sm">{request.hr_remarks}</p>
                  </div>
                )}
                {request.bod_remarks && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">BOD</p>
                    <p className="text-sm">{request.bod_remarks}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Timeline */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Timeline</p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                <div>
                  <p className="text-sm font-medium">Submitted</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(request.created_at), 'PPp')}
                  </p>
                </div>
              </div>
              {request.supervisor_verified_at && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <div>
                    <p className="text-sm font-medium">Verified by Supervisor</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(request.supervisor_verified_at), 'PPp')}
                    </p>
                  </div>
                </div>
              )}
              {request.hr_approved_at && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <div>
                    <p className="text-sm font-medium">Approved by HR</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(request.hr_approved_at), 'PPp')}
                    </p>
                  </div>
                </div>
              )}
              {request.bod_reviewed_at && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <div>
                    <p className="text-sm font-medium">Reviewed by BOD</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(request.bod_reviewed_at), 'PPp')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
