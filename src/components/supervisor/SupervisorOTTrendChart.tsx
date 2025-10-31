import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';

interface WeekData {
  week: string;
  hours: number;
}

export function SupervisorOTTrendChart() {
  const [data, setData] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Get all weeks in the current month
      const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });

      // Fetch all OT requests for this month
      const { data: otRequests } = await supabase
        .from('ot_requests')
        .select('ot_date, total_hours')
        .eq('supervisor_id', user.id)
        .gte('ot_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('ot_date', format(monthEnd, 'yyyy-MM-dd'));

      // Group by week
      const weeklyData = weeks.map((weekStart, index) => {
        const weekEndDate = endOfWeek(weekStart);
        const weekLabel = `Week ${index + 1}`;

        const weekHours = otRequests?.reduce((sum, req) => {
          const reqDate = new Date(req.ot_date);
          if (reqDate >= weekStart && reqDate <= weekEndDate) {
            return sum + (req.total_hours || 0);
          }
          return sum;
        }, 0) || 0;

        return {
          week: weekLabel,
          hours: parseFloat(weekHours.toFixed(1))
        };
      });

      setData(weeklyData);
    } catch (error) {
      console.error('Error fetching trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Monthly OT Trend</CardTitle>
        <CardDescription>Track how your team's OT hours have evolved this month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="week" 
              className="text-xs text-muted-foreground"
            />
            <YAxis 
              className="text-xs text-muted-foreground"
              label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="hours" 
              stroke="hsl(var(--info))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--info))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
