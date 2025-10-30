import { Clock, FileText, CheckCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatHours } from '@/lib/otCalculations';
import { OTRequest } from '@/types/otms';

interface OTSummaryCardsProps {
  requests: OTRequest[];
}

export function OTSummaryCards({ requests }: OTSummaryCardsProps) {
  const totalRequests = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending_verification').length;
  const totalHours = requests.reduce((sum, r) => sum + (r.total_hours || 0), 0);
  const totalApproved = requests
    .filter(r => r.status === 'approved' || r.status === 'reviewed')
    .reduce((sum, r) => sum + (r.ot_amount || 0), 0);

  const cards = [
    {
      title: 'Total Requests',
      value: totalRequests,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Pending Approval',
      value: pendingCount,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Total OT Hours',
      value: formatHours(totalHours) + ' hrs',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Amount Approved',
      value: formatCurrency(totalApproved),
      icon: DollarSign,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
