import { Button } from '@/components/ui/button';
import { CheckCircle, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroBannerProps {
  name?: string;
}

export function HeroBanner({ name }: HeroBannerProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl p-8 shadow-lg bg-gradient-to-br from-info to-info/80 text-info-foreground mb-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Supervisor Dashboard</h1>
          <p className="text-info-foreground/90 mt-2">
            {name ? `Welcome back, ${name}!` : 'Welcome back!'} Here's your team's OT overview for this month.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => navigate('/supervisor/verify')}
            className="gap-2 bg-card text-info hover:bg-card/90 font-semibold shadow-md"
          >
            <CheckCircle className="h-4 w-4" />
            Verify OT Requests
          </Button>
          <Button 
            onClick={() => navigate('/hr/ot-reports')}
            variant="outline"
            className="gap-2 border-info-foreground/20 text-info-foreground hover:bg-info-foreground/10"
          >
            <BarChart className="h-4 w-4" />
            View Team Reports
          </Button>
        </div>
      </div>
    </div>
  );
}
