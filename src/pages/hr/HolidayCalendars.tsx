import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHolidayCalendars } from '@/hooks/hr/useHolidayCalendars';
import { useDeleteHolidayCalendar } from '@/hooks/hr/useDeleteHolidayCalendar';
import { Link } from 'react-router-dom';
import { CalendarIcon, Edit, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function HolidayCalendars() {
  const { data: calendars, isLoading, error } = useHolidayCalendars();
  const { mutate: deleteCalendar } = useDeleteHolidayCalendar();

  const handleDelete = (id: string) => {
    deleteCalendar(id);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-8 w-8" />
              Holiday Calendars
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage holiday calendars used by OT day-type detection
            </p>
          </div>
          <Button asChild>
            <Link to="/hr/calendar/new">
              <Plus className="mr-2 h-4 w-4" />
              New Holiday Calendar
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load holiday calendars. Please try again.
            </AlertDescription>
          </Alert>
        ) : calendars?.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No holiday calendars yet</p>
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
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Total Holidays</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calendars?.map((calendar) => (
                  <TableRow key={calendar.id}>
                    <TableCell className="font-medium">{calendar.name}</TableCell>
                    <TableCell>
                      {calendar.state_code ? (
                        <Badge variant="secondary">{calendar.state_code}</Badge>
                      ) : (
                        <span className="text-muted-foreground">All States</span>
                      )}
                    </TableCell>
                    <TableCell>{calendar.year}</TableCell>
                    <TableCell>{calendar.total_holidays}</TableCell>
                    <TableCell>
                      {format(new Date(calendar.created_at), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/hr/calendar/${calendar.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Holiday Calendar?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{calendar.name}" and all its holidays. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(calendar.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
