import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface StatusData {
  name: string;
  value: number;
  color: string;
}

export function EmployeeOTStatusChart() {
  const { user } = useAuth();
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStatusData();
    }
  }, [user]);

  const fetchStatusData = async () => {
    if (!user) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: requests, error } = await supabase
      .from('ot_requests')
      .select('status')
      .eq('employee_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error fetching status data:', error);
      setLoading(false);
      return;
    }

    const approvedCount = requests?.filter(r => 
      r.status === 'hr_certified' || r.status === 'bod_approved' || r.status === 'supervisor_verified'
    ).length || 0;
    const pendingCount = requests?.filter(r => 
      r.status === 'pending_verification'
    ).length || 0;
    const rejectedCount = requests?.filter(r => 
      r.status === 'rejected'
    ).length || 0;

    const statusData: StatusData[] = [
      { name: 'Approved', value: approvedCount, color: '#22C55E' },
      { name: 'Pending', value: pendingCount, color: '#EAB308' },
      { name: 'Rejected', value: rejectedCount, color: '#EF4444' }
    ].filter(item => item.value > 0);

    setData(statusData);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle>Request Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[260px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle>Request Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] flex items-center justify-center">
          <p className="text-muted-foreground">No OT requests this month</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader>
        <CardTitle>Request Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
