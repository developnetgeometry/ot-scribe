import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface WeeklyData {
  week: string;
  hours: number;
}

export function EmployeeOTWeeklyChart() {
  const { user } = useAuth();
  const [data, setData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWeeklyData();
    }
  }, [user]);

  const fetchWeeklyData = async () => {
    if (!user) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const { data: requests, error } = await supabase
      .from('ot_requests')
      .select('ot_date, total_hours')
      .eq('employee_id', user.id)
      .gte('ot_date', startOfMonth.toISOString().split('T')[0])
      .lte('ot_date', endOfMonth.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching weekly data:', error);
      setLoading(false);
      return;
    }

    // Group by week
    const weeklyMap = new Map<number, number>();
    requests?.forEach(req => {
      const date = new Date(req.ot_date);
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const daysSinceFirst = Math.floor((date.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24));
      const weekNum = Math.floor(daysSinceFirst / 7) + 1;
      
      weeklyMap.set(weekNum, (weeklyMap.get(weekNum) || 0) + (req.total_hours || 0));
    });

    // Create data for all weeks (1-5)
    const weeklyData: WeeklyData[] = [];
    for (let i = 1; i <= 5; i++) {
      weeklyData.push({
        week: `Week ${i}`,
        hours: Number((weeklyMap.get(i) || 0).toFixed(1))
      });
    }

    setData(weeklyData);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle>Weekly OT Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[260px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader>
        <CardTitle>Weekly OT Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="week" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="hours" fill="#5F26B4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
