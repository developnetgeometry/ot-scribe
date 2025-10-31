import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const WEEKDAYS = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

interface WeeklyOffSelectorProps {
  dateFrom: string;
  dateTo: string;
  onGenerate: (dates: string[]) => void;
}

export function WeeklyOffSelector({ dateFrom, dateTo, onGenerate }: WeeklyOffSelectorProps) {
  const [selectedDay, setSelectedDay] = useState<string>('0');

  const handleGenerate = () => {
    if (!dateFrom || !dateTo) {
      return;
    }

    const start = new Date(dateFrom + 'T00:00:00');
    const end = new Date(dateTo + 'T00:00:00');
    const targetDay = parseInt(selectedDay);
    const dates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === targetDay) {
        dates.push(d.toISOString().split('T')[0]);
      }
    }

    onGenerate(dates);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Weekly Off Day</Label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {WEEKDAYS.map((day) => (
                <SelectItem key={day.value} value={day.value.toString()}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleGenerate}
            disabled={!dateFrom || !dateTo}
            className="w-full"
          >
            Add to Holidays
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Populate all weekly offs within the selected date range into the Holidays table.
      </p>
    </div>
  );
}
