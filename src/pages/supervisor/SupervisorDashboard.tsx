import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Clock, ClipboardList, CheckSquare } from 'lucide-react';
import { SupervisorDashboardCard } from '@/components/supervisor/SupervisorDashboardCard';
import { SupervisorOTTrendChart } from '@/components/supervisor/SupervisorOTTrendChart';
import { OTVerificationBreakdownChart } from '@/components/supervisor/OTVerificationBreakdownChart';
import { SupervisorQuickActions } from '@/components/supervisor/SupervisorQuickActions';
import { FooterNote } from '@/components/supervisor/FooterNote';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    teamOTHours: 0,
    pendingVerifications: 0,
    verifiedRequests: 0,
    teamMembersCount: 0,
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

    // Fetch team members count
    const { count: teamCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('supervisor_id', user.id)
      .eq('status', 'active');

    // Fetch OT requests for team
    const { data: otRequests } = await supabase
      .from('ot_requests')
      .select('total_hours, status')
      .eq('supervisor_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    const teamOTHours = otRequests?.reduce((sum, req) => sum + (req.total_hours || 0), 0) || 0;
    const pendingVerifications = otRequests?.filter(req => req.status === 'pending_verification').length || 0;
    const verifiedRequests = otRequests?.filter(req => req.status === 'verified' || req.status === 'approved' || req.status === 'reviewed').length || 0;

    setStats({
      teamOTHours,
      pendingVerifications,
      verifiedRequests,
      teamMembersCount: teamCount || 0,
    });
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold">Supervisor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {fullName || 'Supervisor'}! Here's your team's OT performance overview for this month.
          </p>
        </div>

        {/* KPI Cards Grid */}
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
              <SupervisorDashboardCard
                title="Team Members"
                value={stats.teamMembersCount}
                subtitle="Active employees under your team"
                icon={Users}
                variant="blue"
              />
              <SupervisorDashboardCard
                title="Pending Verifications"
                value={stats.pendingVerifications}
                subtitle="Awaiting your review"
                icon={ClipboardList}
                variant="purple"
              />
              <SupervisorDashboardCard
                title="Verified Requests"
                value={stats.verifiedRequests}
                subtitle="Approved this month"
                icon={CheckSquare}
                variant="green"
              />
              <SupervisorDashboardCard
                title="Total Team OT Hours"
                value={stats.teamOTHours.toFixed(1)}
                subtitle="This month"
                icon={Clock}
                variant="yellow"
              />
            </>
          )}
        </div>

        {/* Overview Charts Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Overview Charts</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Visualize your team's overtime activities and verification trends.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <SupervisorOTTrendChart />
            <OTVerificationBreakdownChart />
          </div>
        </div>

        {/* Quick Actions Section */}
        <SupervisorQuickActions />

        {/* Footer Note */}
        <FooterNote />
      </div>
    </AppLayout>
  );
}
