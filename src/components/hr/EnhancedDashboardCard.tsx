import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedDashboardCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'info' | 'warning' | 'success' | 'primary';
}

export function EnhancedDashboardCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle,
  variant = 'primary'
}: EnhancedDashboardCardProps) {
  const gradientClasses = {
    info: 'from-info/20 to-info/10',
    warning: 'from-warning/20 to-warning/10',
    success: 'from-success/20 to-success/10',
    primary: 'from-primary/20 to-primary/10',
  };

  const iconColorClasses = {
    info: 'text-info',
    warning: 'text-warning',
    success: 'text-success',
    primary: 'text-primary',
  };

  return (
    <Card className={cn(
      'border-0 shadow-md transition-all hover:shadow-lg hover:scale-[1.02]',
      'bg-gradient-to-br',
      gradientClasses[variant]
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2 text-foreground">{value}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center',
            'bg-card shadow-sm',
            iconColorClasses[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
