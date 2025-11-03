import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { OTRequest } from '@/types/otms';

interface OTApprovalStatsProps {
  requests: OTRequest[];
}

export function OTApprovalStats({ requests }: OTApprovalStatsProps) {
  const pendingCount = requests.filter(r => r.status === 'supervisor_verified').length;
  const approvedThisMonth = requests.filter(r => {
    const isApproved = r.status === 'hr_certified';
    const isThisMonth = r.hr_approved_at && 
      new Date(r.hr_approved_at).getMonth() === new Date().getMonth();
    return isApproved && isThisMonth;
  }).length;

  const stats = [
    {
      title: 'Pending HR Approval',
      value: pendingCount,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Approved This Month',
      value: approvedThisMonth,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Rejected This Month',
      value: requests.filter(r => r.status === 'rejected' && r.hr_approved_at &&
        new Date(r.hr_approved_at).getMonth() === new Date().getMonth()).length,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
