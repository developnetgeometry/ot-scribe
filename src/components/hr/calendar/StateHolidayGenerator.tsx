import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MALAYSIA_STATES } from '@/lib/malaysiaStates';
import { useGenerateStateHolidays } from '@/hooks/hr/useGenerateStateHolidays';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StateHolidayGeneratorProps {
  year: number;
  onGenerate: (holidays: Array<{ holiday_date: string; description: string; state_code: string }>) => void;
}

export function StateHolidayGenerator({ year, onGenerate }: StateHolidayGeneratorProps) {
  const [stateCode, setStateCode] = useState<string>('ALL');
  const [manualDate, setManualDate] = useState('');
  const [manualDescription, setManualDescription] = useState('');

  const { mutate: generateHolidays, isPending } = useGenerateStateHolidays();

  const handleGenerate = () => {
    generateHolidays(
      { year, stateCode },
      {
        onSuccess: (data) => {
          if (data.length === 0) {
            toast.warning('No holidays found for this state/year');
            return;
          }
          onGenerate(data);
          toast.success(`Generated ${data.length} state holiday${data.length > 1 ? 's' : ''}`);
        },
      }
    );
  };

  const handleAddManual = () => {
    if (!manualDate || !manualDescription) {
      toast.error('Please fill in date and description');
      return;
    }

    onGenerate([
      {
        holiday_date: manualDate,
        description: manualDescription,
        state_code: stateCode,
      },
    ]);

    setManualDate('');
    setManualDescription('');
    toast.success('Holiday added');
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Malaysia State</Label>
          <Select value={stateCode} onValueChange={setStateCode}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {MALAYSIA_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Year</Label>
          <Input type="number" value={year} disabled />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerate}
            disabled={isPending}
            className="w-full"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate from State Calendar
          </Button>
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-base mb-4 block">Add Manual Holiday</Label>
        <div className="grid gap-4 md:grid-cols-[1fr_2fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="manual-date">Date</Label>
            <Input
              id="manual-date"
              type="date"
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-desc">Description</Label>
            <Input
              id="manual-desc"
              type="text"
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              placeholder="Holiday name"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddManual}
            >
              Add Holiday
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
