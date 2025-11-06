import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OTApprovalTable } from '@/components/approvals/OTApprovalTable';
import { useOTApproval } from '@/hooks/useOTApproval';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ApproveOT() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('hr_certified');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
  const { 
    requests, 
    isLoading, 
    approveRequest: approveRequestMutation, 
    rejectRequest: rejectRequestMutation, 
  } = useOTApproval({ role: 'management', status: activeTab });

  const filteredRequests = requests?.filter(request => {
    if (!searchQuery) return true;
    const profile = (request as any).profiles;
    const employeeName = profile?.full_name?.toLowerCase() || '';
    const employeeId = profile?.employee_id?.toLowerCase() || '';
    const department = (profile?.departments as any)?.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return employeeName.includes(query) || employeeId.includes(query) || department.includes(query);
  }) || [];

  // Smart tab selection based on request status
  useEffect(() => {
    const requestId = searchParams.get('request');
    if (requestId) {
      const fetchRequestStatus = async () => {
        const { data } = await supabase
          .from('ot_requests')
          .select('status')
          .eq('id', requestId)
          .maybeSingle();
        
        if (data) {
          const statusToTab: Record<string, string> = {
            'hr_certified': 'hr_certified',
            'management_approved': 'management_approved',
            'rejected': 'rejected',
          };
          
          const tab = statusToTab[data.status] || 'all';
          setActiveTab(tab);
        }
      };
      
      fetchRequestStatus();
    }
  }, [searchParams]);

  // Auto-open request from URL parameter
  useEffect(() => {
    const requestId = searchParams.get('request');
    if (requestId && requests && requests.length > 0) {
      setSelectedRequestId(requestId);
      // Clear the parameter after opening
      searchParams.delete('request');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, requests, setSearchParams, activeTab]);

  const handleApprove = async (requestIds: string[], remarks?: string) => {
    await approveRequestMutation({ requestIds, remarks });
  };

  const handleReject = async (requestIds: string[], remarks: string) => {
    await rejectRequestMutation({ requestIds, remarks });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Management Approval</h1>
          <p className="text-muted-foreground">Review and approve overtime requests as Management</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="hr_certified">
          <TabsList>
            <TabsTrigger value="hr_certified">Pending Management Review</TabsTrigger>
            <TabsTrigger value="management_approved">Reviewed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by employee, department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <OTApprovalTable 
                  requests={filteredRequests} 
                  isLoading={isLoading}
                  role="management"
                  approveRequest={handleApprove}
                  rejectRequest={handleReject}
                  showActions={activeTab === 'hr_certified'}
                  initialSelectedRequestId={selectedRequestId}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
