import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthData {
  month: string;
  hours: number;
}

export function OTTrendChart() {
  const [data, setData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOTTrendData();
  }, []);

  const fetchOTTrendData = async () => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: otData, error } = await supabase
        .from('ot_requests')
        .select('ot_date, total_hours')
        .gte('ot_date', sixMonthsAgo.toISOString().split('T')[0])
        .order('ot_date');

      if (error) throw error;

      // Group by month
      const monthMap = new Map<string, number>();
      otData?.forEach(item => {
        const date = new Date(item.ot_date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + (item.total_hours || 0));
      });

      const chartData = Array.from(monthMap.entries()).map(([month, hours]) => ({
        month,
        hours: Math.round(hours * 10) / 10,
      }));

      setData(chartData);
    } catch (error) {
      console.error('Error fetching OT trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    hours: {
      label: "OT Hours",
      color: "hsl(var(--info))",
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly OT Trend</CardTitle>
          <CardDescription>Track total overtime hours per month</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly OT Trend</CardTitle>
          <CardDescription>Track total overtime hours per month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No OT data available for the last 6 months
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly OT Trend</CardTitle>
        <CardDescription>Track total overtime hours per month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="hsl(var(--info))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--info))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
