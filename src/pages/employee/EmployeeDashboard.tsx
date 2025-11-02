import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { EnhancedEmployeeDashboardCard } from '@/components/employee/EnhancedEmployeeDashboardCard';
import { EmployeeOTWeeklyChart } from '@/components/employee/EmployeeOTWeeklyChart';
import { EmployeeOTStatusChart } from '@/components/employee/EmployeeOTStatusChart';
import { QuickTips } from '@/components/employee/QuickTips';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, RefreshCcw, CheckCircle2, Plus, History } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalHours: 0,
    pendingRequests: 0,
    approvedRequests: 0,
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
      .select('total_hours, status')
      .eq('employee_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
      return;
    }

    const totalHours = data?.reduce((sum, req) => sum + (req.total_hours || 0), 0) || 0;
    const pendingRequests = data?.filter(req => 
      req.status === 'pending_verification'
    ).length || 0;
    const approvedRequests = data?.filter(req => 
      req.status === 'approved' || req.status === 'reviewed' || req.status === 'verified'
    ).length || 0;

    setStats({ totalHours, pendingRequests, approvedRequests });
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 bg-muted/30 -m-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {fullName ? `Welcome back, ${fullName}!` : 'Welcome back!'} Here's your OT overview for this month.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => navigate('/ot/submit')} 
            className="gap-2 font-semibold shadow-lg hover:shadow-xl transition-shadow"
            style={{ 
              backgroundColor: '#5F26B4',
              boxShadow: '0 4px 8px rgba(95, 38, 180, 0.25)'
            }}
          >
            <Plus className="h-4 w-4" />
            Submit OT Request
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <>
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </>
          ) : (
            <>
              <EnhancedEmployeeDashboardCard
                title="Total OT Hours"
                value={stats.totalHours.toFixed(1)}
                subtitle="This month"
                icon={Clock}
                variant="purple"
              />
              <EnhancedEmployeeDashboardCard
                title="Pending Requests"
                value={stats.pendingRequests}
                subtitle="Awaiting approval"
                icon={RefreshCcw}
                variant="yellow"
              />
              <EnhancedEmployeeDashboardCard
                title="Approved Requests"
                value={stats.approvedRequests}
                subtitle="This month"
                icon={CheckCircle2}
                variant="green"
              />
            </>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Monthly OT Overview</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <EmployeeOTWeeklyChart />
            <EmployeeOTStatusChart />
          </div>
        </div>

        <QuickTips />
      </div>
    </AppLayout>
  );
}
