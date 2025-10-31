import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [selectedDays, setSelectedDays] = useState<number[]>([0]); // Default Sunday

  const toggleDay = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
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
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === targetDay) {
          allDates.push(d.toISOString().split('T')[0]);
        }
      }
    });

    // Sort dates chronologically
    allDates.sort();
    
    onGenerate(allDates);
  };

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
      <Button
        type="button"
        variant="secondary"
        onClick={handleGenerate}
        disabled={!dateFrom || !dateTo || selectedDays.length === 0}
        className="w-full"
      >
        Add {selectedDays.length > 0 ? `${selectedDays.length} Weekly Off${selectedDays.length > 1 ? 's' : ''}` : 'Weekly Offs'} to Holidays
      </Button>
      <p className="text-sm text-muted-foreground">
        Select one or more days to mark as weekly offs. All occurrences within the date range will be added to the holidays table.
      </p>
    </div>
  );
}
