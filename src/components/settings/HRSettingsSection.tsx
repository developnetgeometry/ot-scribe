import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Users, Building, Calendar, DollarSign, Briefcase, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * HR Settings Section
 * 
 * Shows HR-specific settings options for users with HR role.
 * Provides quick access to the dedicated HR Settings page.
 */
export function HRSettingsSection() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  // Only show for HR users
  if (!hasRole('hr')) {
    return null;
  }

  const hrSettingsFeatures = [
    { icon: Users, label: 'Eligibility Rules' },
    { icon: DollarSign, label: 'OT Thresholds' },
    { icon: Briefcase, label: 'Pay Formulas' },
    { icon: Building, label: 'Company Profile' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          HR Settings
        </CardTitle>
        <CardDescription>
          Configure overtime rules, company settings, and system parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {hrSettingsFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <feature.icon className="h-4 w-4" />
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={() => navigate('/hr/settings')} 
          className="w-full gap-2"
        >
          <Settings className="h-4 w-4" />
          Open HR Settings
        </Button>
      </CardContent>
    </Card>
  );
}