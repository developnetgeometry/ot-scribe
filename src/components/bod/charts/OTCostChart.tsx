import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface DepartmentCost {
  name: string;
  value: number;
}

const COLORS = ['#5F26B4', '#8B5CF6', '#C084FC', '#DDD6FE'];

export function OTCostChart() {
  const [data, setData] = useState<DepartmentCost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCostData();
  }, []);

  const fetchCostData = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: otData } = await supabase
      .from('ot_requests')
      .select(`
        ot_amount,
        profiles!ot_requests_employee_id_fkey(
          department_id,
          departments!profiles_department_id_fkey(name)
        )
      `)
      .gte('created_at', startOfMonth.toISOString())
      .not('ot_amount', 'is', null);

    if (otData) {
      const departmentMap = new Map<string, number>();

      otData.forEach((item: any) => {
        const deptName = item.profiles?.departments?.name || 'Unknown';
        const amount = item.ot_amount || 0;
        departmentMap.set(deptName, (departmentMap.get(deptName) || 0) + amount);
      });

      const chartData = Array.from(departmentMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setData(chartData);
    }
    setLoading(false);
  };

  const chartConfig = {
    value: {
      label: 'Cost',
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OT Cost Distribution</CardTitle>
          <CardDescription>By Department</CardDescription>
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
          <CardTitle>OT Cost Distribution</CardTitle>
          <CardDescription>By Department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No cost data available for this month
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>OT Cost Distribution</CardTitle>
        <CardDescription>By Department (Current Month)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
