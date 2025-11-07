import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  const { roles, getDefaultRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { from?: string; requiredRoles?: string[] } | null) || null;

  const handleGoToDashboard = () => {
    const dashboardPath = getDefaultRoute();
    navigate(dashboardPath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state?.from && (
            <div className="text-center text-xs text-muted-foreground">
              Requested page: <span className="font-medium text-foreground">{state.from}</span>
            </div>
          )}
          {state?.requiredRoles && (
            <div className="text-center text-xs text-muted-foreground">
              Required role{state.requiredRoles.length > 1 ? 's' : ''}: <span className="font-medium text-foreground">{state.requiredRoles.join(', ')}</span>
            </div>
          )}
          <div className="text-center text-sm text-muted-foreground">
            Your current role{roles.length > 1 ? 's' : ''}: <span className="font-semibold text-foreground">{roles.join(', ')}</span>
          </div>
          <Button onClick={handleGoToDashboard} className="w-full">
            Go to My Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
