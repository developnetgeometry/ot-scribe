import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, isLoadingRoles, isLoadingProfile, getDefaultRoute } = useAuth();

  // Redirect authenticated users to their dashboard
  // Wait for server state (roles, profile) to load before navigating
  useEffect(() => {
    // Only navigate when we have a user AND server state is loaded
    if (user && !isLoadingRoles && !isLoadingProfile) {
      const defaultRoute = getDefaultRoute();
      navigate(defaultRoute, { replace: true });
    }
  }, [user, isLoadingRoles, isLoadingProfile, getDefaultRoute, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Look up email from employee_id
      const { data, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .eq('employee_id', employeeId.trim())
        .single();

      if (lookupError || !data) {
        toast.error('Employee ID not found. Please check and try again.');
        setIsSubmitting(false);
        return;
      }

      // Use the email to sign in with Supabase Auth
      const { error } = await signIn(data.email, password);

      if (error) {
        toast.error(error.message || 'Unable to sign in. Please try again.');
        setIsSubmitting(false);
        return;
      }

      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err.message || 'Unable to sign in. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCreateTestUsers = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-test-users', {
        body: {}
      });

      if (error) throw error;

      toast.success('Test users created successfully! Check console for credentials.');
      console.log('Test Users:', data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create test users');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">OTMS Login</CardTitle>
          <CardDescription>
            Enter your Employee ID and password to access the Overtime Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="e.g., EMP001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>New Employee?</AlertTitle>
            <AlertDescription>
              Use your Employee ID and temporary password: <strong className="font-semibold">Temp@12345</strong>
              <br />
              <span className="text-xs text-muted-foreground">
                You'll be required to change it on first login.
              </span>
            </AlertDescription>
          </Alert>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCreateTestUsers}
              disabled={isSubmitting}
            >
              Create Test Users (Dev Only)
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Forgot password? Contact HR for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
