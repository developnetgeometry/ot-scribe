import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';

import { OTApprovalTable } from '@/components/approvals/OTApprovalTable';
import { useOTApproval } from '@/hooks/useOTApproval';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function VerifyOT() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { requests, isLoading } = useOTApproval({ role: 'supervisor', status: 'all' });

  const filteredRequests = requests?.filter(request => {
    if (!searchQuery) return true;
    const profile = (request as any).profiles;
    const employeeName = profile?.full_name?.toLowerCase() || '';
    const employeeId = profile?.employee_id?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return employeeName.includes(query) || employeeId.includes(query);
  }) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verify OT Requests</h1>
          <p className="text-muted-foreground">Review and verify overtime requests from your team</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <OTApprovalTable 
              requests={filteredRequests} 
              isLoading={isLoading}
              role="supervisor"
            />
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
