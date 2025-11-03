import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/ot/FileUpload';
import { useOTResubmit } from '@/hooks/useOTResubmit';
import { OTRequest } from '@/types/otms';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  ot_date: z.date(),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  attachment_url: z.string().nullable().optional(),
});

interface ResubmitOTFormProps {
  request: OTRequest;
  onSuccess?: () => void;
}

export function ResubmitOTForm({ request, onSuccess }: ResubmitOTFormProps) {
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(request.attachment_url);
  const resubmitMutation = useOTResubmit();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ot_date: new Date(request.ot_date),
      start_time: request.start_time,
      end_time: request.end_time,
      reason: request.reason,
      attachment_url: request.attachment_url,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const startTime = new Date(`2000-01-01T${values.start_time}`);
    const endTime = new Date(`2000-01-01T${values.end_time}`);
    const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    if (totalHours <= 0) {
      form.setError('end_time', { message: 'End time must be after start time' });
      return;
    }

    await resubmitMutation.mutateAsync({
      originalRequestId: request.id,
      ot_date: format(values.ot_date, 'yyyy-MM-dd'),
      start_time: values.start_time,
      end_time: values.end_time,
      total_hours: totalHours,
      day_type: request.day_type,
      reason: values.reason,
      attachment_url: attachmentUrl,
    });

    onSuccess?.();
  };

  const rejectionReason = request.supervisor_remarks || request.hr_remarks || request.bod_remarks;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {rejectionReason && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Previous Rejection Reason:</strong>
              <p className="mt-2">{rejectionReason}</p>
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="ot_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>OT Date</FormLabel>
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
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="time" className="pl-10" {...field} />
                  </div>
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
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="time" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Overtime</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explain why this overtime was necessary and address previous rejection remarks..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Supporting Document (Optional)</FormLabel>
          <FileUpload
            onUploadComplete={(url) => {
              setAttachmentUrl(url);
              form.setValue('attachment_url', url);
            }}
            onRemove={() => {
              setAttachmentUrl(null);
              form.setValue('attachment_url', null);
            }}
            currentFile={attachmentUrl || undefined}
          />
        </div>

        <Button type="submit" className="w-full" disabled={resubmitMutation.isPending}>
          {resubmitMutation.isPending ? 'Resubmitting...' : 'Resubmit OT Request'}
        </Button>
      </form>
    </Form>
  );
}
