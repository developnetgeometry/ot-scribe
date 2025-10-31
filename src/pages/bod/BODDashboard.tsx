import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { EnhancedDashboardCard } from '@/components/hr/EnhancedDashboardCard';
import { OTTrendChart } from '@/components/hr/charts/OTTrendChart';
import { OTCostChart } from '@/components/bod/charts/OTCostChart';
import { QuickInsights } from '@/components/bod/QuickInsights';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, DollarSign, Clock, TrendingUp, FileText, BarChart } from 'lucide-react';

export default function BODDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOTHours: 0,
    totalExpenditure: 0,
    complianceRate: 0,
    monthlyTrend: '+0%',
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

    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    // Current month data
    const { data: currentMonthData } = await supabase
      .from('ot_requests')
      .select('total_hours, ot_amount, status')
      .gte('created_at', startOfMonth.toISOString());

    // Last month data for trend
    const { data: lastMonthData } = await supabase
      .from('ot_requests')
      .select('total_hours')
      .gte('created_at', startOfLastMonth.toISOString())
      .lt('created_at', startOfMonth.toISOString());

    const totalOTHours = currentMonthData?.reduce((sum, req) => sum + (req.total_hours || 0), 0) || 0;
    const totalExpenditure = currentMonthData?.reduce((sum, req) => sum + (req.ot_amount || 0), 0) || 0;
    
    const approvedCount = currentMonthData?.filter(req => 
      req.status === 'approved' || req.status === 'reviewed'
    ).length || 0;
    const totalCount = currentMonthData?.length || 1;
    const complianceRate = Math.round((approvedCount / totalCount) * 100);

    const lastMonthHours = lastMonthData?.reduce((sum, req) => sum + (req.total_hours || 0), 0) || 1;
    const trend = lastMonthHours > 0 ? ((totalOTHours - lastMonthHours) / lastMonthHours) * 100 : 0;
    const monthlyTrend = `${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`;

    setStats({
      totalOTHours,
      totalExpenditure,
      complianceRate,
      monthlyTrend,
    });
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">BOD Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {fullName ? `Welcome back, ${fullName}!` : 'Welcome back!'} Here's your executive overview.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/bod/review')} className="gap-2">
              <FileText className="h-4 w-4" />
              Review Reports
            </Button>
            <Button onClick={() => navigate('/hr/ot-reports')} variant="outline" className="gap-2">
              <BarChart className="h-4 w-4" />
              View Analytics
            </Button>
          </div>
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
              <EnhancedDashboardCard
                icon={Clock}
                title="Organization OT Hours"
                value={stats.totalOTHours.toFixed(1)}
                subtitle="This month"
                variant="info"
              />
              <EnhancedDashboardCard
                icon={DollarSign}
                title="Total Expenditure"
                value={`RM ${stats.totalExpenditure.toFixed(2)}`}
                subtitle="OT payments this month"
                variant="primary"
              />
              <EnhancedDashboardCard
                icon={CheckCircle}
                title="Compliance Rate"
                value={`${stats.complianceRate}%`}
                subtitle="Approved requests"
                variant="success"
              />
              <EnhancedDashboardCard
                icon={TrendingUp}
                title="Monthly Trend"
                value={stats.monthlyTrend}
                subtitle="vs last month"
                variant="warning"
              />
            </>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-1">Analytics Overview</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Visual summary of organizational overtime and expenditure performance
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <OTTrendChart />
            <OTCostChart />
          </div>
        </div>

        <QuickInsights />
      </div>
    </AppLayout>
  );
}
