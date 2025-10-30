import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OTApprovalTable } from '@/components/hr/approve/OTApprovalTable';
import { OTApprovalStats } from '@/components/hr/approve/OTApprovalStats';
import { useOTApprovals } from '@/hooks/hr/useOTApprovals';

export default function ApproveOT() {
  const [statusFilter, setStatusFilter] = useState<string>('verified');
  const { data: requests, isLoading } = useOTApprovals({ status: statusFilter });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">OT Approvals</h1>
          <p className="text-muted-foreground">Review and approve overtime requests</p>
        </div>

        <OTApprovalStats requests={requests || []} />

        <Card className="p-6">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="verified">Pending Approval</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-6">
              <OTApprovalTable 
                requests={requests || []} 
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
}
