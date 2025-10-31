import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useActiveHolidayCalendar } from '@/hooks/hr/useActiveHolidayCalendar';
import { Skeleton } from '@/components/ui/skeleton';

export default function HolidayCalendars() {
  const { data: calendar, isLoading } = useActiveHolidayCalendar();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-3">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (calendar) {
    return <Navigate to={`/hr/calendar/${calendar.id}/edit`} replace />;
  }

  return <Navigate to="/hr/calendar/new" replace />;
}
