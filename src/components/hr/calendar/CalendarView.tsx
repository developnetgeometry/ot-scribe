import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { CalendarEvent } from '@/hooks/hr/useCalendarData';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onNavigate: (date: Date) => void;
  date: Date;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
}

export function CalendarView({
  events,
  onSelectEvent,
  onNavigate,
  date,
  view,
  onViewChange,
}: CalendarViewProps) {
  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales: { 'en-US': enUS },
      }),
    []
  );

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '';
    let borderColor = '';

    if (event.type === 'holiday') {
      backgroundColor = 'hsl(var(--chart-5))';
      borderColor = 'hsl(var(--chart-5))';
    } else {
      switch (event.status) {
        case 'approved':
        case 'reviewed':
          backgroundColor = 'hsl(var(--chart-1))';
          borderColor = 'hsl(var(--chart-1))';
          break;
        case 'pending_verification':
          backgroundColor = 'hsl(var(--chart-2))';
          borderColor = 'hsl(var(--chart-2))';
          break;
        case 'verified':
          backgroundColor = 'hsl(var(--chart-3))';
          borderColor = 'hsl(var(--chart-3))';
          break;
        case 'rejected':
          backgroundColor = 'hsl(var(--chart-4))';
          borderColor = 'hsl(var(--chart-4))';
          break;
        default:
          backgroundColor = 'hsl(var(--muted))';
          borderColor = 'hsl(var(--muted))';
      }
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        borderRadius: '4px',
        border: 'none',
        display: 'block',
        fontSize: '0.875rem',
        padding: '2px 4px',
      },
    };
  };

  return (
    <div className="h-[600px] bg-card rounded-lg border p-4">
      <Calendar
        localizer={localizer}
        events={events as Event[]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={(event) => onSelectEvent(event as CalendarEvent)}
        eventPropGetter={eventStyleGetter}
        onNavigate={onNavigate}
        date={date}
        view={view}
        onView={onViewChange}
        views={['month', 'week', 'day']}
        popup
        className="calendar-custom"
      />
    </div>
  );
}
