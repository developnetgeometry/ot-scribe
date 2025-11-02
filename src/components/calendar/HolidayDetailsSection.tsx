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
    <Card className="rounded-xl shadow-md bg-gradient-to-b from-white to-gray-50 border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Holidays on {formattedDate}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {holidays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-full mb-4">
              <CalendarX className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2 text-lg">No Holidays</h3>
            <p className="text-sm text-gray-600">
              There are no public holidays on this date.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {holidays.map((holiday) => {
              const isWeeklyOff = holiday.description.toLowerCase().includes('weekly off');
              const isStateHoliday = holiday.state_code && holiday.state_code !== 'ALL';
              
              const bgColor = isWeeklyOff 
                ? 'from-indigo-50 to-indigo-100 border-indigo-200' 
                : isStateHoliday 
                ? 'from-yellow-50 to-yellow-100 border-yellow-200'
                : 'from-red-50 to-pink-50 border-red-100';
                
              const dotColor = isWeeklyOff
                ? 'from-indigo-500 to-indigo-600'
                : isStateHoliday
                ? 'from-yellow-500 to-yellow-600'
                : 'from-red-500 to-red-600';
              
              return (
                <div key={holiday.id} className={`flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r ${bgColor} border hover:shadow-md transition-shadow duration-200`}>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${dotColor} mt-1.5 flex-shrink-0 shadow-sm`} />
                  <div>
                    <p className="font-semibold text-gray-800 text-base">{holiday.description}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {isWeeklyOff ? 'Weekly Holiday' : isStateHoliday ? `State Holiday (${holiday.state_code})` : 'Public Holiday'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
