import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserPlus, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/otCalculations';

interface Employee {
  status: string;
  basic_salary: number;
}

interface EmployeeStatsProps {
  employees: Employee[];
}

export function EmployeeStats({ employees }: EmployeeStatsProps) {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const avgSalary = employees.length > 0 
    ? employees.reduce((sum, e) => sum + e.basic_salary, 0) / employees.length 
    : 0;

  const stats = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Employees',
      value: activeEmployees,
      icon: UserCheck,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pending Activation',
      value: totalEmployees - activeEmployees,
      icon: UserPlus,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Average Salary',
      value: formatCurrency(avgSalary),
      icon: DollarSign,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
