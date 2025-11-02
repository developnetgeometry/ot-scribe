import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedEmployeeDashboardCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'purple' | 'yellow' | 'green';
}

export function EnhancedEmployeeDashboardCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle,
  variant = 'purple'
}: EnhancedEmployeeDashboardCardProps) {
  const gradientClasses = {
    purple: 'from-purple-100 to-purple-50 dark:from-purple-950/40 dark:to-purple-900/20',
    yellow: 'from-yellow-100 to-yellow-50 dark:from-yellow-950/40 dark:to-yellow-900/20',
    green: 'from-green-100 to-green-50 dark:from-green-950/40 dark:to-green-900/20',
  };

  const iconColorClasses = {
    purple: 'text-purple-600 dark:text-purple-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    green: 'text-green-600 dark:text-green-400',
  };

  return (
    <Card className={cn(
      'border-0 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
      'bg-gradient-to-br rounded-2xl',
      gradientClasses[variant]
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn(
            'h-14 w-14 rounded-full flex items-center justify-center',
            'bg-card shadow-sm',
            iconColorClasses[variant]
          )}>
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
