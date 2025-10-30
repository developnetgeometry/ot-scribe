import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Users, FileText, DollarSign, Clock } from 'lucide-react';

export default function HRDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingApprovals: 0,
    approvedThisMonth: 0,
    totalOTAmount: 0,
    totalOTHours: 0,
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
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Fetch employee count
    const { count: employeeCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Fetch OT requests
    const { data: otRequests } = await supabase
      .from('ot_requests')
      .select('total_hours, status, ot_amount')
      .gte('created_at', startOfMonth.toISOString());

    const pendingApprovals = otRequests?.filter(req => 
      req.status === 'pending_verification' || req.status === 'verified'
    ).length || 0;

    const approvedThisMonth = otRequests?.filter(req => 
      req.status === 'approved' || req.status === 'reviewed'
    ).length || 0;

    const totalOTAmount = otRequests?.reduce((sum, req) => sum + (req.ot_amount || 0), 0) || 0;
    const totalOTHours = otRequests?.reduce((sum, req) => sum + (req.total_hours || 0), 0) || 0;

    setStats({
      totalEmployees: employeeCount || 0,
      pendingApprovals,
      approvedThisMonth,
      totalOTAmount,
      totalOTHours,
    });
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HR Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {fullName ? `Welcome back, ${fullName}!` : 'Welcome back!'} Here's your organization overview.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/hr/approve')} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Approve OT Requests
          </Button>
          <Button onClick={() => navigate('/hr/employees')} variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Manage Employees
          </Button>
          <Button onClick={() => navigate('/hr/ot-reports')} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            View Reports
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
                title="Total Employees"
                value={stats.totalEmployees}
                subtitle="Active employees"
                icon={Users}
              />
              <DashboardCard
                title="Pending Approvals"
                value={stats.pendingApprovals}
                subtitle="Awaiting action"
                icon={CheckCircle}
              />
              <DashboardCard
                title="Approved This Month"
                value={stats.approvedThisMonth}
                subtitle="OT requests approved"
                icon={FileText}
              />
              <DashboardCard
                title="Total OT Hours"
                value={stats.totalOTHours.toFixed(1)}
                subtitle="This month"
                icon={Clock}
              />
              <DashboardCard
                title="Total OT Amount"
                value={`RM ${stats.totalOTAmount.toFixed(2)}`}
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
