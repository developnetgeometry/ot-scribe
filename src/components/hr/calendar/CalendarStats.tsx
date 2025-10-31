import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarEvent } from '@/hooks/hr/useCalendarData';
import { formatCurrency, formatHours } from '@/lib/otCalculations';
import { Clock, DollarSign, FileText, CheckCircle } from 'lucide-react';

interface CalendarStatsProps {
  events: CalendarEvent[];
}

export function CalendarStats({ events }: CalendarStatsProps) {
  const otEvents = events.filter(e => e.type === 'ot_request');
  
  const totalHours = otEvents.reduce((sum, e) => sum + (e.hours || 0), 0);
  const totalAmount = otEvents.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalRequests = otEvents.length;
  const approvedRequests = otEvents.filter(
    e => e.status === 'approved' || e.status === 'reviewed'
  ).length;

  const stats = [
    {
      title: 'Total OT Hours',
      value: formatHours(totalHours) + ' hrs',
      icon: Clock,
    },
    {
      title: 'Total OT Amount',
      value: formatCurrency(totalAmount),
      icon: DollarSign,
    },
    {
      title: 'Total Requests',
      value: totalRequests.toString(),
      icon: FileText,
    },
    {
      title: 'Approved',
      value: approvedRequests.toString(),
      icon: CheckCircle,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
