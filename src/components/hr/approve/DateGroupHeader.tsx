import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface DateGroupHeaderProps {
  date: string;
  requestCount: number;
}

export function DateGroupHeader({ date, requestCount }: DateGroupHeaderProps) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-muted/50 rounded-lg mb-4 mt-6 first:mt-0">
      <Calendar className="h-5 w-5 text-primary" />
      <div className="flex-1">
        <h3 className="font-semibold text-base text-foreground">
          {format(new Date(date), 'EEEE, dd MMM yyyy')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {requestCount} {requestCount === 1 ? 'request' : 'requests'}
        </p>
      </div>
    </div>
  );
}
