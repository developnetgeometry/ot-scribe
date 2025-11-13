import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AppLayout } from '@/components/AppLayout';
import { OTHistoryTable } from '@/components/ot/OTHistoryTable';
import { OTDetailsSheet } from '@/components/ot/OTDetailsSheet';
import { OTSummaryCards } from '@/components/ot/OTSummaryCards';
import { ResubmitOTForm } from '@/components/ot/ResubmitOTForm';
import { EditOTForm } from '@/components/ot/EditOTForm';
import { OTFilterPanel } from '@/components/ot/OTFilterPanel';
import { useOTRequests } from '@/hooks/useOTRequests';
import { useOTFilters } from '@/hooks/useOTFilters';
import { OTRequest } from '@/types/otms';
import { Skeleton } from '@/components/ui/skeleton';

export default function OTHistory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRequest, setSelectedRequest] = useState<OTRequest | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);
  const [resubmitRequest, setResubmitRequest] = useState<OTRequest | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRequest, setEditRequest] = useState<OTRequest | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const { filters, updateFilter, clearFilters, applyDatePreset, activeFilterCount } = useOTFilters();

  const { data: requests = [], isLoading } = useOTRequests({
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    ticketNumber: filters.ticketNumber,
    dayType: filters.dayType,
    minHours: filters.minHours,
    maxHours: filters.maxHours,
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
  });

  // Auto-open request from URL parameter
  useEffect(() => {
    const requestId = searchParams.get('request');
    if (requestId && requests.length > 0) {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        setSelectedRequest(request);
        setSheetOpen(true);
        // Clear the parameter after opening
        searchParams.delete('request');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, requests, setSearchParams]);

  const handleViewDetails = (request: OTRequest) => {
    setSelectedRequest(request);
    setSheetOpen(true);
  };

  const handleResubmit = (request: OTRequest) => {
    setResubmitRequest(request);
    setResubmitDialogOpen(true);
  };

  const handleEdit = (request: OTRequest) => {
    if (request.status === 'rejected') {
      // Rejected requests should use resubmit flow
      handleResubmit(request);
    } else {
      // Pending requests use edit flow
      setEditRequest(request);
      setEditDialogOpen(true);
    }
  };

  const handleExportCSV = () => {
    if (!requests.length) return;

    const headers = ['Ticket', 'Date', 'Day Type', 'Hours', 'Amount', 'Status', 'Reason'];
    const rows = requests.map(r => [
      r.ticket_number,
      r.ot_date,
      r.day_type,
      r.total_hours,
      r.ot_amount || 0,
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
    const filterSuffix = activeFilterCount > 0 ? '-filtered' : '';
    a.href = url;
    a.download = `ot-history${filterSuffix}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">OT Request History</h1>
              <p className="text-muted-foreground text-sm md:text-base">View and track your overtime requests</p>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>All Requests</CardTitle>
                <CardDescription>
                  {activeFilterCount > 0 
                    ? `Filtered results (${requests.length} ${requests.length === 1 ? 'request' : 'requests'})`
                    : 'Complete history of your OT submissions'
                  }
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={filterOpen ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={requests.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Collapsible open={filterOpen} onOpenChange={setFilterOpen}>
              <CollapsibleContent>
                <OTFilterPanel
                  filters={filters}
                  updateFilter={updateFilter}
                  clearFilters={clearFilters}
                  applyDatePreset={applyDatePreset}
                  activeFilterCount={activeFilterCount}
                />
              </CollapsibleContent>
            </Collapsible>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {activeFilterCount > 0 
                  ? 'No OT requests match your filters. Try adjusting your search criteria.'
                  : 'No OT requests found. Submit your first OT request to get started.'
                }
              </div>
            ) : (
              <OTHistoryTable 
                requests={requests} 
                onViewDetails={handleViewDetails}
              />
            )}
          </CardContent>
        </Card>

        <OTDetailsSheet
          request={selectedRequest}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onEdit={handleEdit}
        />

        <Dialog open={resubmitDialogOpen} onOpenChange={setResubmitDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Resubmit OT Request</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {resubmitRequest && (
                <ResubmitOTForm
                  request={resubmitRequest}
                  onSuccess={() => {
                    setResubmitDialogOpen(false);
                    setResubmitRequest(null);
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Edit OT Request</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {editRequest && (
                <EditOTForm
                  request={editRequest}
                  onSuccess={() => {
                    setEditDialogOpen(false);
                    setEditRequest(null);
                  }}
                  onCancel={() => setEditDialogOpen(false)}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
