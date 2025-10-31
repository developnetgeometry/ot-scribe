import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CalendarEvent } from '@/hooks/hr/useCalendarData';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatHours, getDayTypeLabel } from '@/lib/otCalculations';
import { OTStatus } from '@/types/otms';

interface CalendarEventSheetProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarEventSheet({ event, open, onOpenChange }: CalendarEventSheetProps) {
  if (!event) return null;

  if (event.type === 'holiday') {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Public Holiday</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p className="text-sm text-muted-foreground">
                {format(event.start, 'PPPP')}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>OT Request Details</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div>
            <StatusBadge status={event.status as OTStatus} />
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Employee</h4>
              <p className="text-base font-medium mt-1">
                {event.employee?.name || 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground">
                {event.employee?.employee_id} • {event.employee?.department}
              </p>
            </div>

            {event.supervisor && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Supervisor</h4>
                <p className="text-base mt-1">{event.supervisor.name}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Date & Time</h4>
              <p className="text-base mt-1">{format(event.start, 'PPPP')}</p>
              <p className="text-sm text-muted-foreground">
                {format(event.start, 'p')} - {format(event.end, 'p')}
              </p>
            </div>

            {event.day_type && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Day Type</h4>
                <Badge variant="outline" className="mt-1">
                  {getDayTypeLabel(event.day_type)}
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Total Hours</h4>
                <p className="text-lg font-semibold mt-1">
                  {formatHours(event.hours || 0)} hrs
                </p>
              </div>
              {event.amount !== null && event.amount !== undefined && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">OT Amount</h4>
                  <p className="text-lg font-semibold mt-1">
                    {formatCurrency(event.amount)}
                  </p>
                </div>
              )}
            </div>

            {event.reason && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Reason</h4>
                <p className="text-sm mt-1">{event.reason}</p>
              </div>
            )}

            {event.remarks && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Remarks</h4>
                <p className="text-sm mt-1">{event.remarks}</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
