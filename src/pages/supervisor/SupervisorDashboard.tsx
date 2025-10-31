import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Clock, ClipboardList, CheckSquare } from 'lucide-react';
import { SupervisorDashboardCard } from '@/components/supervisor/SupervisorDashboardCard';
import { HeroBanner } from '@/components/supervisor/HeroBanner';
import { SupervisorOTTrendChart } from '@/components/supervisor/SupervisorOTTrendChart';
import { RecentTeamOTTable } from '@/components/supervisor/RecentTeamOTTable';
import { InsightBanner } from '@/components/supervisor/InsightBanner';

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
  const [avgOTPerMember, setAvgOTPerMember] = useState(0);

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

    const avgOT = teamCount && teamCount > 0 ? teamOTHours / teamCount : 0;

    setStats({
      teamOTHours,
      pendingVerifications,
      verifiedRequests,
      teamMembersCount: teamCount || 0,
    });
    setAvgOTPerMember(avgOT);
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <HeroBanner name={fullName} />

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
                subtitle="Direct reports"
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
                subtitle="This month"
                icon={CheckSquare}
                variant="green"
              />
              <SupervisorDashboardCard
                title="Team OT Hours"
                value={stats.teamOTHours.toFixed(1)}
                subtitle="Total this month"
                icon={Clock}
                variant="yellow"
              />
            </>
          )}
        </div>

        <SupervisorOTTrendChart />

        <RecentTeamOTTable />

        <InsightBanner 
          avgOTPerMember={avgOTPerMember}
          teamMembersCount={stats.teamMembersCount}
        />
      </div>
    </AppLayout>
  );
}
