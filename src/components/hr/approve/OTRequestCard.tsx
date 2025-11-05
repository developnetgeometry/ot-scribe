import { CheckCircle, XCircle, User, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { GroupedOTRequest } from '@/types/otms';
import { formatTime12Hour, formatHours } from '@/lib/otCalculations';

interface OTRequestCardProps {
  request: GroupedOTRequest;
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  showActions?: boolean;
}

export function OTRequestCard({ 
  request, 
  onApprove, 
  onReject, 
  onViewDetails,
  isApproving,
  isRejecting,
  showActions = true
}: OTRequestCardProps) {
  const profile = (request as any).profiles;

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer mb-3"
      onClick={onViewDetails}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left Section: Employee Info */}
          <div className="flex-1 space-y-3">
            {/* Employee Name & ID */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-semibold text-base">
                  {profile?.full_name || 'Unknown Employee'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile?.employee_id || request.employee_id}
                </p>
              </div>
            </div>

            {/* OT Sessions */}
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Submitted OT Sessions
                </p>
                {request.sessions.map((session, idx) => (
                  <div key={idx} className="text-sm text-foreground">
                    {formatTime12Hour(session.start_time)} - {formatTime12Hour(session.end_time)}
                    <span className="text-muted-foreground ml-2">
                      ({formatHours(session.total_hours)} hrs)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Hours */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Total OT Hours
                </p>
                <p className="text-lg font-semibold text-primary">
                  {formatHours(request.total_hours)} hours
                </p>
              </div>
            </div>

            {/* Status & Violations */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={request.status} />
              {request.threshold_violations && Object.keys(request.threshold_violations).length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  With Violations
                </Badge>
              )}
            </div>
          </div>

          {/* Right Section: Actions */}
          {showActions && onApprove && onReject && (
            <div 
              className="flex flex-col gap-2 min-w-[120px]"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="sm"
                variant="default"
                onClick={onApprove}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700 text-white w-full"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {isApproving ? 'Certifying...' : 'Certify'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={onReject}
                disabled={isRejecting}
                className="w-full"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
