import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from './FileUpload';
import { calculateTotalHours, getDayTypeColor, getDayTypeLabel } from '@/lib/otCalculations';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const otFormSchema = z.object({
  ot_date: z.date({
    required_error: 'OT date is required',
  }),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  reason_dropdown: z.enum([
    'System maintenance',
    'Project deadline',
    'Unexpected breakdown',
    'Client support',
    'Staff shortage',
    'Other'
  ], {
    required_error: 'Please select a reason for overtime',
  }),
  reason_other: z.string()
    .max(500, 'Reason cannot exceed 500 characters')
    .optional(),
  attachment_url: z.string().optional(),
}).refine((data) => {
  if (data.reason_dropdown === 'Other') {
    return data.reason_other && data.reason_other.trim().length >= 10;
  }
  return true;
}, {
  message: 'Please provide a detailed reason (at least 10 characters)',
  path: ['reason_other'],
});

type OTFormValues = z.infer<typeof otFormSchema>;

interface OTFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  employeeId: string;
  fullName: string;
  onCancel: () => void;
}

export function OTForm({ onSubmit, isSubmitting, employeeId, fullName, onCancel }: OTFormProps) {
  const [totalHours, setTotalHours] = useState<number>(0);
  const [dayType, setDayType] = useState<string>('weekday');

  const form = useForm<OTFormValues>({
    resolver: zodResolver(otFormSchema),
    defaultValues: {
      reason_other: '',
      attachment_url: '',
    },
  });

  const startTime = form.watch('start_time');
  const endTime = form.watch('end_time');
  const otDate = form.watch('ot_date');

  useEffect(() => {
    if (startTime && endTime) {
      const hours = calculateTotalHours(startTime, endTime);
      setTotalHours(hours);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (otDate) {
      determineDayType(otDate);
    }
  }, [otDate]);

  const determineDayType = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    // Check if public holiday
    const { data: holiday } = await supabase
      .from('public_holidays')
      .select('*')
      .eq('holiday_date', dateStr)
      .single();

    if (holiday) {
      setDayType('public_holiday');
    } else if (dayOfWeek === 0) {
      setDayType('sunday');
    } else if (dayOfWeek === 6) {
      setDayType('saturday');
    } else {
      setDayType('weekday');
    }
  };

  const handleSubmit = (values: OTFormValues) => {
    const finalReason = values.reason_dropdown === 'Other' 
      ? values.reason_other || ''
      : values.reason_dropdown;
    
    onSubmit({
      ot_date: format(values.ot_date, 'yyyy-MM-dd'),
      start_time: values.start_time,
      end_time: values.end_time,
      total_hours: totalHours,
      day_type: dayType,
      reason: finalReason,
      attachment_url: values.attachment_url || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        {/* Employee Information Card */}
        <Card className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <Input 
                type="text" 
                value={employeeId}
                readOnly
                className="bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input 
                type="text" 
                value={fullName}
                readOnly
                className="bg-white"
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="ot_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>OT Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Hours</p>
              <p className="text-2xl font-bold">{totalHours.toFixed(1)} hrs</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Day Type</p>
              <Badge className={getDayTypeColor(dayType)}>
                {getDayTypeLabel(dayType)}
              </Badge>
            </div>
          </div>
        </Card>

        <FormField
          control={form.control}
          name="reason_dropdown"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for OT *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select reason for overtime" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="System maintenance">System maintenance</SelectItem>
                  <SelectItem value="Project deadline">Project deadline</SelectItem>
                  <SelectItem value="Unexpected breakdown">Unexpected breakdown</SelectItem>
                  <SelectItem value="Client support">Client support</SelectItem>
                  <SelectItem value="Staff shortage">Staff shortage</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('reason_dropdown') === 'Other' && (
          <FormField
            control={form.control}
            name="reason_other"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Reason (if applicable)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your own reason"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="attachment_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attachment (Optional)</FormLabel>
              <FormControl>
                <FileUpload
                  onUploadComplete={field.onChange}
                  onRemove={() => field.onChange('')}
                  currentFile={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit OT Request'}
          </Button>
          <Button 
            type="button" 
            variant="secondary"
            onClick={onCancel}
            className="w-full text-gray-600 border hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
