import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectUser = async () => {
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const role = roleData?.role;

        switch(role) {
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'hr':
            navigate('/hr/dashboard', { replace: true });
            break;
          case 'supervisor':
            navigate('/supervisor/dashboard', { replace: true });
            break;
          case 'bod':
            navigate('/bod/dashboard', { replace: true });
            break;
          case 'employee':
            navigate('/employee/dashboard', { replace: true });
            break;
          default:
            navigate('/dashboard', { replace: true });
        }
      }
    };

    redirectUser();
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Fetch user session to get user ID
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Fetch user profile with status
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, status')
        .eq('id', session.user.id)
        .single();

      // Check if password needs to be set up
      if (profile?.status === 'pending_setup') {
        toast.info('Please set up your password to continue');
        navigate('/setup-password');
        setLoading(false);
        return;
      }

      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const role = roleData?.role;
      const fullName = profile?.full_name || 'User';

      toast.success(`Welcome back, ${fullName}!`);

      // Redirect based on role
      switch(role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'hr':
          navigate('/hr/dashboard');
          break;
        case 'supervisor':
          navigate('/supervisor/dashboard');
          break;
        case 'bod':
          navigate('/bod/dashboard');
          break;
        case 'employee':
          navigate('/employee/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  const handleCreateTestUsers = async () => {
    setLoading(true);
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
      setLoading(false);
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCreateTestUsers}
              disabled={loading}
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