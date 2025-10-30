import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { DashboardCard } from '@/components/DashboardCard';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, roles, hasRole } = useAuth();
  const [stats, setStats] = useState({
    totalHours: 0,
    pending: 0,
    approved: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const isEmployee = hasRole('employee');
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const query = supabase
        .from('ot_requests')
        .select('total_hours, status, ot_amount');

      if (isEmployee) {
        query.eq('employee_id', user.id);
      }

      query.gte('ot_date', startOfMonth.toISOString());

      const { data, error } = await query;

      if (error) throw error;

      const totalHours = data?.reduce((sum, req) => sum + (req.total_hours || 0), 0) || 0;
      const pending = data?.filter(req => req.status === 'pending_verification').length || 0;
      const approved = data?.filter(req => req.status === 'approved' || req.status === 'reviewed').length || 0;
      const totalAmount = data?.reduce((sum, req) => sum + (req.ot_amount || 0), 0) || 0;

      setStats({ totalHours, pending, approved, totalAmount });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const isEmployee = hasRole('employee');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your OT status.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              icon={Clock}
              title="Total OT Hours"
              value={stats.totalHours.toFixed(2)}
              subtitle="Current month"
            />
            <DashboardCard
              icon={AlertCircle}
              title="Pending Requests"
              value={stats.pending}
              subtitle="Awaiting verification"
            />
            <DashboardCard
              icon={CheckCircle}
              title="Approved Requests"
              value={stats.approved}
              subtitle="This month"
            />
            {!isEmployee && (
              <DashboardCard
                icon={DollarSign}
                title="Total OT Amount"
                value={`RM ${stats.totalAmount.toFixed(2)}`}
                subtitle="Current month"
              />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}