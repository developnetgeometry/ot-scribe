import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Users, Clock, FileText } from 'lucide-react';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Supervisor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {fullName ? `Welcome back, ${fullName}!` : 'Welcome back!'} Here's your team overview for this month.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/supervisor/verify')} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Verify OT Requests
          </Button>
          <Button onClick={() => navigate('/hr/ot-reports')} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            View Team Reports
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
                title="Team Members"
                value={stats.teamMembersCount}
                subtitle="Direct reports"
                icon={Users}
              />
              <DashboardCard
                title="Pending Verifications"
                value={stats.pendingVerifications}
                subtitle="Awaiting your verification"
                icon={CheckCircle}
              />
              <DashboardCard
                title="Verified Requests"
                value={stats.verifiedRequests}
                subtitle="This month"
                icon={FileText}
              />
              <DashboardCard
                title="Team OT Hours"
                value={stats.teamOTHours.toFixed(1)}
                subtitle="This month"
                icon={Clock}
              />
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
