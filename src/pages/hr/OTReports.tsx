import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OTDashboard } from '@/components/hr/reports/OTDashboard';
import { DetailedReportTable } from '@/components/hr/reports/DetailedReportTable';
import { EmployeeSummaryReport } from '@/components/hr/reports/EmployeeSummaryReport';
import { DepartmentComparisonReport } from '@/components/hr/reports/DepartmentComparisonReport';

export default function OTReports() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">OT Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive overtime reporting and insights</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
            <TabsTrigger value="employee">Employee Summary</TabsTrigger>
            <TabsTrigger value="department">Department Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <OTDashboard />
          </TabsContent>

          <TabsContent value="detailed" className="mt-6">
            <Card className="p-6">
              <DetailedReportTable />
            </Card>
          </TabsContent>

          <TabsContent value="employee" className="mt-6">
            <Card className="p-6">
              <EmployeeSummaryReport />
            </Card>
          </TabsContent>

          <TabsContent value="department" className="mt-6">
            <Card className="p-6">
              <DepartmentComparisonReport />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
