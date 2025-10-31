import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { OTStatus } from '@/types/otms';

interface RecentOTRequest {
  id: string;
  ot_date: string;
  total_hours: number;
  status: OTStatus;
  employee_name: string;
  employee_id: string;
}

export function RecentTeamOTTable() {
  const [requests, setRequests] = useState<RecentOTRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentRequests();
  }, []);

  const fetchRecentRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('ot_requests')
        .select(`
          id,
          ot_date,
          total_hours,
          status,
          profiles!ot_requests_employee_id_fkey(
            full_name,
            employee_id
          )
        `)
        .eq('supervisor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const formattedData = data?.map(req => ({
        id: req.id,
        ot_date: req.ot_date,
        total_hours: req.total_hours,
        status: req.status,
        employee_name: (req.profiles as any)?.full_name || 'Unknown',
        employee_id: (req.profiles as any)?.employee_id || 'N/A'
      })) || [];

      setRequests(formattedData);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: OTStatus) => {
    switch (status) {
      case 'pending_verification':
        return 'warning';
      case 'verified':
      case 'approved':
      case 'reviewed':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: OTStatus) => {
    switch (status) {
      case 'pending_verification':
        return 'Pending';
      case 'verified':
        return 'Verified';
      case 'approved':
        return 'Approved';
      case 'reviewed':
        return 'Reviewed';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
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
        <CardTitle className="text-lg font-semibold">Recent Team OT Requests</CardTitle>
        <CardDescription>Quick view of your team's latest overtime submissions</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No recent OT requests</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>OT Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.employee_name}</TableCell>
                  <TableCell>{format(new Date(request.ot_date), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{request.total_hours.toFixed(1)} hrs</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
