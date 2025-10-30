import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, History, Clock, CheckCircle, DollarSign } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalHours: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    
    if (data) setFullName(data.full_name);
  };

  const fetchStats = async () => {
    if (!user) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('ot_requests')
      .select('total_hours, status, ot_amount')
      .eq('employee_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
      return;
    }

    const totalHours = data?.reduce((sum, req) => sum + (req.total_hours || 0), 0) || 0;
    const pendingRequests = data?.filter(req => req.status === 'pending_verification').length || 0;
    const approvedRequests = data?.filter(req => req.status === 'approved' || req.status === 'reviewed').length || 0;
    const totalAmount = data?.reduce((sum, req) => sum + (req.ot_amount || 0), 0) || 0;

    setStats({ totalHours, pendingRequests, approvedRequests, totalAmount });
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {fullName ? `Welcome back, ${fullName}!` : 'Welcome back!'} Here's your OT overview for this month.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/ot/submit')} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Submit OT Request
          </Button>
          <Button onClick={() => navigate('/ot/history')} variant="outline" className="gap-2">
            <History className="h-4 w-4" />
            View OT History
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <DashboardCard
                title="Total OT Hours"
                value={stats.totalHours.toFixed(1)}
                subtitle="This month"
                icon={Clock}
              />
              <DashboardCard
                title="Pending Requests"
                value={stats.pendingRequests}
                subtitle="Awaiting approval"
                icon={History}
              />
              <DashboardCard
                title="Approved Requests"
                value={stats.approvedRequests}
                subtitle="This month"
                icon={CheckCircle}
              />
              <DashboardCard
                title="Total OT Amount"
                value={`RM ${stats.totalAmount.toFixed(2)}`}
                subtitle="This month"
                icon={DollarSign}
              />
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
