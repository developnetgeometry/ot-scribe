import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, DollarSign, Users, Clock } from 'lucide-react';

export function OTDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Requests (MTD)',
            value: '0',
            icon: FileText,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-500/10',
          },
          {
            title: 'Total Amount (MTD)',
            value: 'RM 0.00',
            icon: DollarSign,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-500/10',
          },
          {
            title: 'Avg OT per Employee',
            value: '0 hrs',
            icon: Users,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-500/10',
          },
          {
            title: 'Pending Approvals',
            value: '0',
            icon: Clock,
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-500/10',
          },
        ].map((stat, index) => {
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

      <Card className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          <p>Charts and analytics will appear here</p>
          <p className="text-sm mt-2">Data will be populated as OT requests are processed</p>
        </div>
      </Card>
    </div>
  );
}
