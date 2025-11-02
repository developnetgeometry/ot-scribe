import { useState } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { Edit } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarLegend } from "@/components/calendar/CalendarLegend";
import { HolidayDetailsSection } from "@/components/calendar/HolidayDetailsSection";
import { useHolidayCalendarView } from "@/hooks/useHolidayCalendarView";
import { useAuth } from "@/hooks/useAuth";
import { useActiveHolidayCalendar } from "@/hooks/hr/useActiveHolidayCalendar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: activeCalendar, isLoading: isCalendarLoading } = useActiveHolidayCalendar();
  const { data: holidays, isLoading, error } = useHolidayCalendarView(activeCalendar?.id);
  const { hasRole } = useAuth();

  const publicHolidays = holidays?.filter(h => 
    !h.description.toLowerCase().includes('weekly off') && 
    !h.state_code
  ).map(h => parseISO(h.holiday_date)) || [];

  const weeklyHolidays = holidays?.filter(h => 
    h.description.toLowerCase().includes('weekly off')
  ).map(h => parseISO(h.holiday_date)) || [];

  const stateHolidays = holidays?.filter(h => 
    h.state_code && h.state_code !== 'ALL'
  ).map(h => parseISO(h.holiday_date)) || [];

  const selectedHolidays = holidays?.filter(h => 
    isSameDay(parseISO(h.holiday_date), selectedDate)
  ) || [];

  const modifiers = {
    publicHoliday: publicHolidays,
    weeklyHoliday: weeklyHolidays,
    stateHoliday: stateHolidays,
    sunday: (date: Date) => date.getDay() === 0,
  };

  const modifiersClassNames = {
    publicHoliday: "bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] text-[#DC2626] font-semibold border-red-200",
    weeklyHoliday: "bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE] text-[#4F46E5] font-semibold border-indigo-200",
    stateHoliday: "bg-gradient-to-br from-[#FEF9C3] to-[#FEF08A] text-[#CA8A04] font-semibold border-yellow-200",
    sunday: "text-[#DC2626] font-semibold",
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5F26B4] to-[#8B5CF6] bg-clip-text text-transparent">
            📅 Calendar
          </h1>
          <p className="text-gray-600">View all holidays and off days configured by HR. This calendar is visible to all users but editable only by HR.</p>
        </div>
        {(hasRole('hr') || hasRole('admin')) && activeCalendar && (
          <Button asChild disabled={isCalendarLoading} className="bg-gradient-to-r from-[#5F26B4] to-[#8B5CF6] hover:from-[#4A1D8F] hover:to-[#7C3AED] shadow-[0_2px_8px_rgba(95,38,180,0.2)] hover:shadow-[0_4px_12px_rgba(95,38,180,0.3)] transition-all duration-200">
            <Link to={`/hr/calendar/${activeCalendar.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Calendar
            </Link>
          </Button>
        )}
        </div>
        {isLoading ? (
          <Card className="p-6">
            <Skeleton className="h-80 w-full" />
          </Card>
        ) : error ? (
          <Card className="p-6">
            <p className="text-destructive text-center">
              Failed to load calendar data. Please try again later.
            </p>
          </Card>
        ) : (
          <Card className="p-8 rounded-xl shadow-lg bg-gradient-to-b from-white to-gray-50 border-gray-100">
            <CalendarUI
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="w-full max-w-4xl mx-auto"
            />
          </Card>
        )}

        <CalendarLegend />

        <HolidayDetailsSection 
          selectedDate={selectedDate} 
          holidays={selectedHolidays}
        />

        <Card className="rounded-xl shadow-md bg-gradient-to-b from-white to-gray-50 border-gray-100 p-4">
          <p className="text-center text-xs text-gray-500">
            Calendar is managed by HR and synchronized for all users across the organization.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
