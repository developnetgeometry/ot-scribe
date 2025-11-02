import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface MonthPickerProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthPicker({ selectedMonth, onMonthChange }: MonthPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-start">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(selectedMonth, 'MMMM yyyy')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3 rounded-xl shadow-lg border border-[#E5E7EB] bg-white" align="end">
        <Calendar
          mode="single"
          selected={selectedMonth}
          onSelect={(date) => {
            if (date) {
              onMonthChange(date);
              setOpen(false);
            }
          }}
          defaultMonth={selectedMonth}
          disabled={(date) => date > new Date()}
          compact={true}
          className="pointer-events-auto"
        />
        <div className="text-center text-[11px] text-[#9CA3AF] pt-2 border-t border-gray-100 mt-2">
          Select a month to view report
        </div>
      </PopoverContent>
    </Popover>
  );
}
