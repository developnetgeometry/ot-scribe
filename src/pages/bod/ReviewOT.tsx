import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';

import { OTApprovalTable } from '@/components/approvals/OTApprovalTable';
import { useOTApproval } from '@/hooks/useOTApproval';
import { Input } from '@/components/ui/input';
import { Search, DollarSign, Clock, AlertTriangle, FileCheck } from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';
import { formatCurrency, formatHours } from '@/lib/otCalculations';

export default function ReviewOT() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { requests, isLoading } = useOTApproval({ role: 'bod', status: 'all' });

  const filteredRequests = requests?.filter(request => {
    if (!searchQuery) return true;
    const profile = (request as any).profiles;
    const employeeName = profile?.full_name?.toLowerCase() || '';
    const employeeId = profile?.employee_id?.toLowerCase() || '';
    const department = (profile?.departments as any)?.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return employeeName.includes(query) || employeeId.includes(query) || department.includes(query);
  }) || [];

  // Calculate summary stats
  const pendingReview = requests?.filter(r => r.status === 'approved').length || 0;
  const totalHours = requests?.reduce((sum, r) => sum + (r.total_hours || 0), 0) || 0;
  const totalCost = requests?.reduce((sum, r) => sum + (r.ot_amount || 0), 0) || 0;
  const withViolations = requests?.filter(r => 
    r.threshold_violations && Object.keys(r.threshold_violations).length > 0
  ).length || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">BOD Review</h1>
          <p className="text-muted-foreground">Review all OT requests and focus on those with threshold violations</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Pending Review"
            value={pendingReview}
            icon={FileCheck}
          />
          <DashboardCard
            title="Total OT Hours"
            value={formatHours(totalHours)}
            icon={Clock}
          />
          <DashboardCard
            title="Total OT Cost"
            value={formatCurrency(totalCost)}
            icon={DollarSign}
          />
          <DashboardCard
            title="With Violations"
            value={withViolations}
            icon={AlertTriangle}
          />
        </div>

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
              role="bod"
            />
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
