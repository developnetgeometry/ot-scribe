import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { TrendingUp, Calendar } from 'lucide-react';

interface WeekData {
  week: string;
  hours: number;
}

export function SupervisorOTTrendChart() {
  const [data, setData] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

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
          <Skeleton className={`${isMobile ? 'h-48' : 'h-64'} w-full`} />
        </CardContent>
      </Card>
    );
  }

  // Mobile card view for supervisor trend
  if (isMobile) {
    const totalHours = data.reduce((sum, item) => sum + item.hours, 0);
    const currentWeek = data[data.length - 1]?.hours || 0;
    const previousWeek = data[data.length - 2]?.hours || 0;
    const weeklyChange = previousWeek > 0 ? ((currentWeek - previousWeek) / previousWeek * 100) : 0;

    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Monthly OT Trend</CardTitle>
          <CardDescription>Your team's progress this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-info">{totalHours.toFixed(1)}h</div>
                <div className="text-xs text-muted-foreground">Total Hours</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{currentWeek.toFixed(1)}h</div>
                <div className="text-xs text-muted-foreground">This Week</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {data.slice(-3).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{item.week}</span>
                  </div>
                  <span className="font-medium">{item.hours}h</span>
                </div>
              ))}
            </div>

            {data.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2 border-t">
                <TrendingUp className={`h-4 w-4 ${weeklyChange >= 0 ? 'text-success' : 'text-destructive'}`} />
                <span className={`text-sm font-medium ${weeklyChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {weeklyChange >= 0 ? '+' : ''}{weeklyChange.toFixed(1)}% vs last week
                </span>
              </div>
            )}
          </div>
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
