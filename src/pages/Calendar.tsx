import { useState } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { CalendarLegend } from "@/components/calendar/CalendarLegend";
import { HolidayDetailsSection } from "@/components/calendar/HolidayDetailsSection";
import { useHolidayCalendarView } from "@/hooks/useHolidayCalendarView";
import { Skeleton } from "@/components/ui/skeleton";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: holidays, isLoading, error } = useHolidayCalendarView();

  const holidayDates = holidays?.map(h => parseISO(h.holiday_date)) || [];
  const selectedHolidays = holidays?.filter(h => 
    isSameDay(parseISO(h.holiday_date), selectedDate)
  ) || [];

  const modifiers = {
    holiday: holidayDates,
    sunday: (date: Date) => date.getDay() === 0,
  };

  const modifiersClassNames = {
    holiday: "bg-[#FEE2E2] text-[#DC2626] font-semibold",
    sunday: "text-[#DC2626]",
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View public holidays based on HR's configured calendar.</p>
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
          <Card className="p-8">
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
      </div>
    </AppLayout>
  );
}
