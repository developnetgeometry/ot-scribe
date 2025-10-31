import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

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
  selectedDays: number[];
  onSelectionChange: (days: number[]) => void;
  onGenerate: (dates: string[]) => void;
}

export function WeeklyOffSelector({ dateFrom, dateTo, selectedDays, onSelectionChange, onGenerate }: WeeklyOffSelectorProps) {
  const toggleDay = (dayValue: number) => {
    onSelectionChange(
      selectedDays.includes(dayValue)
        ? selectedDays.filter(d => d !== dayValue)
        : [...selectedDays, dayValue]
    );
  };

  const calculateDateCount = () => {
    if (!dateFrom || !dateTo || selectedDays.length === 0) {
      return 0;
    }

    const start = new Date(dateFrom + 'T00:00:00');
    const end = new Date(dateTo + 'T00:00:00');
    let count = 0;

    selectedDays.forEach(targetDay => {
      const startTime = start.getTime();
      const endTime = end.getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      for (let time = startTime; time <= endTime; time += oneDay) {
        const currentDate = new Date(time);
        if (currentDate.getDay() === targetDay) {
          count++;
        }
      }
    });

    return count;
  };

  const handleGenerate = () => {
    if (!dateFrom || !dateTo || selectedDays.length === 0) {
      return;
    }

    const start = new Date(dateFrom + 'T00:00:00');
    const end = new Date(dateTo + 'T00:00:00');
    const allDates: string[] = [];

    // For each selected day
    selectedDays.forEach(targetDay => {
      const startTime = start.getTime();
      const endTime = end.getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      for (let time = startTime; time <= endTime; time += oneDay) {
        const currentDate = new Date(time);
        if (currentDate.getDay() === targetDay) {
          // Use local date string format to avoid timezone conversion
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          allDates.push(`${year}-${month}-${day}`);
        }
      }
    });

    // Sort dates chronologically
    allDates.sort();
    
    onGenerate(allDates);
  };

  const handleClearSelection = () => {
    onSelectionChange([]);
  };

  const totalDates = calculateDateCount();
  const selectedDayNames = selectedDays
    .map(val => WEEKDAYS.find(d => d.value === val)?.label)
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Select Weekly Off Days</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {WEEKDAYS.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day.value}`}
                checked={selectedDays.includes(day.value)}
                onCheckedChange={() => toggleDay(day.value)}
              />
              <Label 
                htmlFor={`day-${day.value}`} 
                className="cursor-pointer font-normal"
              >
                {day.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      {selectedDays.length > 0 && totalDates > 0 && (
        <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Will add <strong>{totalDates}</strong> holidays for: <strong>{selectedDayNames}</strong>
          </p>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={handleGenerate}
          disabled={!dateFrom || !dateTo || selectedDays.length === 0}
          className="flex-1"
        >
          Add {totalDates > 0 ? `${totalDates}` : ''} Weekly Off{totalDates !== 1 ? 's' : ''} to Holidays
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleClearSelection}
          disabled={selectedDays.length === 0}
        >
          Clear
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Select one or more days to mark as weekly offs. All occurrences within the date range will be added to the holidays table.
      </p>
    </div>
  );
}
