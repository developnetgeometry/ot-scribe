import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Clock } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

export function OTVerificationBreakdownChart() {
  const { user } = useAuth();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      fetchVerificationData();
    }
  }, [user]);

  const fetchVerificationData = async () => {
    if (!user) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: otRequests } = await supabase
      .from('ot_requests')
      .select('status')
      .eq('supervisor_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    const verified = otRequests?.filter(req => 
      req.status === 'supervisor_verified' || req.status === 'hr_certified' || req.status === 'management_approved'
    ).length || 0;

    const pending = otRequests?.filter(req => 
      req.status === 'pending_verification'
    ).length || 0;

    const chartData: ChartData[] = [
      { name: 'Verified', value: verified, fill: '#5F26B4' },
      { name: 'Pending', value: pending, fill: '#C4B5FD' }
    ];

    setData(chartData);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>OT Verification Breakdown</CardTitle>
          <CardDescription>Compare verified and pending OT requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>OT Verification Breakdown</CardTitle>
        <CardDescription>Compare verified and pending OT requests</CardDescription>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <div className="flex items-center space-x-2">
                    {item.name === 'Approved' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-600" />
                    )}
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{item.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  `${value} requests (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
                  ''
                ]}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
