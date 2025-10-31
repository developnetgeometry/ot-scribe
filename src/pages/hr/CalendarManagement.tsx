import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { CalendarView } from '@/components/hr/calendar/CalendarView';
import { CalendarFilters } from '@/components/hr/calendar/CalendarFilters';
import { CalendarEventSheet } from '@/components/hr/calendar/CalendarEventSheet';
import { CalendarStats } from '@/components/hr/calendar/CalendarStats';
import { useCalendarData, CalendarFilters as Filters, CalendarEvent } from '@/hooks/hr/useCalendarData';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { startOfMonth, endOfMonth } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export default function CalendarManagement() {
  const [filters, setFilters] = useState<Filters>({
    viewType: 'all',
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const { data: events, isLoading, error } = useCalendarData(filters);

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSheetOpen(true);
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
    setFilters({
      ...filters,
      startDate: startOfMonth(date),
      endDate: endOfMonth(date),
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-8 w-8" />
              Calendar Management
            </h1>
            <p className="text-muted-foreground mt-1">
              View OT schedules and holidays across the organization
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          <Badge className="bg-[hsl(var(--chart-1))]">Approved/Reviewed</Badge>
          <Badge className="bg-[hsl(var(--chart-2))]">Pending Verification</Badge>
          <Badge className="bg-[hsl(var(--chart-3))]">Verified</Badge>
          <Badge className="bg-[hsl(var(--chart-4))]">Rejected</Badge>
          <Badge className="bg-[hsl(var(--chart-5))]">Public Holiday</Badge>
        </div>

        {isLoading ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-[600px]" />
          </>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load calendar data. Please try again.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <CalendarStats events={events || []} />

            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              <CalendarFilters filters={filters} onFiltersChange={setFilters} />
              
              <CalendarView
                events={events || []}
                onSelectEvent={handleEventSelect}
                onNavigate={handleNavigate}
                date={currentDate}
                view={view}
                onViewChange={setView}
              />
            </div>
          </>
        )}

        <CalendarEventSheet
          event={selectedEvent}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </div>
    </AppLayout>
  );
}
