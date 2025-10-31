import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarX } from "lucide-react";
import { HolidayItem } from "@/hooks/useHolidayCalendarView";

interface HolidayDetailsSectionProps {
  selectedDate: Date;
  holidays: HolidayItem[];
}

export function HolidayDetailsSection({ selectedDate, holidays }: HolidayDetailsSectionProps) {
  const formattedDate = format(selectedDate, "MMMM do, yyyy");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Holidays on {formattedDate}</CardTitle>
      </CardHeader>
      <CardContent>
        {holidays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarX className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No Holidays</h3>
            <p className="text-sm text-muted-foreground">
              There are no public holidays on this date.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {holidays.map((holiday) => (
              <div key={holiday.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{holiday.description}</p>
                  <p className="text-sm text-muted-foreground">Public Holiday</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
