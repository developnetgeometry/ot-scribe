import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardCheck, FileBarChart, UserCog } from 'lucide-react';

export function SupervisorQuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Verify OT Requests',
      description: 'Review and approve pending OT submissions.',
      icon: ClipboardCheck,
      gradient: 'linear-gradient(135deg, #5F26B4, #8B5CF6)',
      textColor: 'text-white',
      route: '/supervisor/verify'
    },
    {
      title: 'View Team Reports',
      description: 'Access detailed team performance and OT summary.',
      icon: FileBarChart,
      gradient: 'linear-gradient(135deg, #A5B4FC, #C7D2FE)',
      textColor: 'text-gray-900',
      route: '/hr/ot-reports'
    },
    {
      title: 'Manage Team Profiles',
      description: "Edit and update your team's information.",
      icon: UserCog,
      gradient: 'linear-gradient(135deg, #FDE68A, #FEF9C3)',
      textColor: 'text-gray-900',
      route: '/hr/employees'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
        <p className="text-muted-foreground text-sm">
          Perform common supervisor actions quickly.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <Card
            key={action.title}
            className="cursor-pointer hover:scale-105 transition-all duration-300 border-0 shadow-md"
            style={{ background: action.gradient }}
            onClick={() => navigate(action.route)}
          >
            <CardContent className="p-6">
              <action.icon className={`h-8 w-8 mb-3 ${action.textColor}`} />
              <h3 className={`font-semibold text-lg mb-2 ${action.textColor}`}>
                {action.title}
              </h3>
              <p className={`text-sm ${action.textColor} opacity-90`}>
                {action.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
