import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/AppLayout';
import { OTHistoryTable } from '@/components/ot/OTHistoryTable';
import { OTDetailsSheet } from '@/components/ot/OTDetailsSheet';
import { OTSummaryCards } from '@/components/ot/OTSummaryCards';
import { useOTRequests } from '@/hooks/useOTRequests';
import { OTRequest } from '@/types/otms';
import { Skeleton } from '@/components/ui/skeleton';

export default function OTHistory() {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<OTRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: requests = [], isLoading } = useOTRequests({ status: statusFilter });

  const handleViewDetails = (request: OTRequest) => {
    setSelectedRequest(request);
    setSheetOpen(true);
  };

  const handleExportCSV = () => {
    if (!requests.length) return;

    const headers = ['Date', 'Day Type', 'Hours', 'Status', 'Reason'];
    const rows = requests.map(r => [
      r.ot_date,
      r.day_type,
      r.total_hours,
      r.status,
      r.reason.replace(/,/g, ';'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ot-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">OT Request History</h1>
              <p className="text-muted-foreground">View and track your overtime requests</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <OTSummaryCards requests={requests} />
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Requests</CardTitle>
                <CardDescription>Complete history of your OT submissions</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending_verification">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <OTHistoryTable requests={requests} onViewDetails={handleViewDetails} />
            )}
          </CardContent>
        </Card>

        <OTDetailsSheet
          request={selectedRequest}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </div>
    </AppLayout>
  );
}
