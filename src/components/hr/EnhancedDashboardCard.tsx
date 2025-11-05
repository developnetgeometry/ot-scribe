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
      <CardContent className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <p className="text-sm font-medium text-muted-foreground leading-none">{title}</p>
            <h3 className="text-3xl font-bold text-foreground leading-none">{value}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{subtitle}</p>}
          </div>
          <div className={cn(
            'h-16 w-16 rounded-full flex items-center justify-center flex-shrink-0',
            'bg-card shadow-sm',
            iconColorClasses[variant]
          )}>
            <Icon className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
