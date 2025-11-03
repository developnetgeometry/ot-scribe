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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, isLoadingRoles, isLoadingProfile, getDefaultRoute } = useAuth();

  // Redirect authenticated users to their dashboard
  // Wait for server state (roles, profile) to load before navigating
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`Auth page: ${timestamp} [INFO] Auth state check`, {
      hasUser: !!user,
      userId: user?.id,
      isLoadingRoles,
      isLoadingProfile
    });

    // Only navigate when we have a user AND server state is loaded
    if (user && !isLoadingRoles && !isLoadingProfile) {
      const defaultRoute = getDefaultRoute();
      console.log(`Auth page: ${timestamp} [INFO] Navigating to ${defaultRoute}`);
      navigate(defaultRoute, { replace: true });
    }
  }, [user, isLoadingRoles, isLoadingProfile, getDefaultRoute, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await signIn(email, password);

    if (error) {
      // Use the user-friendly error message from signIn
      toast.error(error.message || 'Unable to sign in. Please try again.');
      setIsSubmitting(false);
      return;
    }

    // Success - React Query will handle loading server state
    // The useEffect will handle navigation when data is ready
    toast.success('Welcome back!');
    // Keep isSubmitting true - navigation will reset the page
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
            Enter your credentials to access the Overtime Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="employee@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              Your temporary password is: <strong className="font-semibold">Temp@12345</strong>
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
