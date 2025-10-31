import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useActiveHolidayCalendar } from '@/hooks/hr/useActiveHolidayCalendar';
import { Link } from 'react-router-dom';
import { CalendarIcon, Edit, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { HolidayItemsTable } from '@/components/hr/calendar/HolidayItemsTable';

export default function HolidayCalendars() {
  const { data: calendar, isLoading, error } = useActiveHolidayCalendar();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-8 w-8" />
              Holiday Calendar
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage holidays used for OT day-type detection
            </p>
          </div>
          {calendar && (
            <Button asChild>
              <Link to={`/hr/calendar/${calendar.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Calendar
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load holiday calendar. Please try again.
            </AlertDescription>
          </Alert>
        ) : !calendar ? (
          <div className="text-center py-12 border rounded-lg">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No holiday calendar yet</p>
            <p className="text-muted-foreground mb-4">
              Create your first holiday calendar to get started
            </p>
            <Button asChild>
              <Link to="/hr/calendar/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Calendar
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Calendar Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>{calendar.name}</CardTitle>
                <CardDescription>
                  Holiday calendar for {calendar.year}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="text-2xl font-bold">{calendar.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="text-lg font-medium">
                      {calendar.state_code ? (
                        <Badge variant="secondary">{calendar.state_code}</Badge>
                      ) : (
                        <span className="text-muted-foreground">All States</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Period</p>
                    <p className="text-lg font-medium">
                      {format(new Date(calendar.date_from), 'dd MMM')} - {format(new Date(calendar.date_to), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Holidays</p>
                    <p className="text-2xl font-bold">{calendar.total_holidays}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Holidays Table */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Holidays</h2>
              <HolidayItemsTable items={calendar.items} readOnly />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
