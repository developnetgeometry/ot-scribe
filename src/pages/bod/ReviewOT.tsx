import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, DollarSign, Clock, AlertTriangle, FileCheck, Download, FileText } from 'lucide-react';
import { EnhancedDashboardCard } from '@/components/hr/EnhancedDashboardCard';
import { BODReportTable } from '@/components/bod/BODReportTable';
import { useBODReportData } from '@/hooks/useBODReportData';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils';
import { formatCurrency, formatHours } from '@/lib/otCalculations';
import { toast } from '@/hooks/use-toast';

export default function ReviewOT() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, isLoading } = useBODReportData();

  const aggregatedData = data?.aggregated || [];
  const stats = data?.stats || {
    pendingReview: 0,
    totalHours: 0,
    totalCost: 0,
    withViolations: 0
  };

  const filteredData = aggregatedData.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.employee_no.toLowerCase().includes(query) ||
      item.employee_name.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query) ||
      item.position.toLowerCase().includes(query)
    );
  });

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There is no data available for the selected period.',
        variant: 'destructive'
      });
      return;
    }

    const headers = [
      { key: 'employee_no', label: 'Employee No.' },
      { key: 'employee_name', label: 'Name' },
      { key: 'department', label: 'Department' },
      { key: 'position', label: 'Position' },
      { key: 'total_ot_hours', label: 'Total OT Hours' },
      { key: 'amount', label: 'Amount (RM)' },
      { key: 'monthly_total', label: 'Monthly Total (RM)' }
    ];

    const formattedData = filteredData.map(row => ({
      ...row,
      total_ot_hours: formatHours(row.total_ot_hours),
      amount: formatCurrency(row.amount),
      monthly_total: formatCurrency(row.monthly_total)
    }));

    const currentDate = new Date().toISOString().split('T')[0];
    exportToCSV(formattedData, `BOD_OT_Report_${currentDate}`, headers);
    
    toast({
      title: 'Report exported',
      description: 'CSV file has been downloaded successfully.'
    });
  };

  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There is no data available for the selected period.',
        variant: 'destructive'
      });
      return;
    }

    exportToPDF();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">BOD Review</h1>
          <p className="text-muted-foreground">Review all OT requests and summarize monthly performance by department and position. Export report for executive review.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedDashboardCard
            title="Pending Review"
            value={stats.pendingReview}
            icon={FileCheck}
            variant="primary"
          />
          <EnhancedDashboardCard
            title="Total OT Hours"
            value={formatHours(stats.totalHours)}
            icon={Clock}
            variant="info"
          />
          <EnhancedDashboardCard
            title="Total OT Cost"
            value={formatCurrency(stats.totalCost)}
            icon={DollarSign}
            variant="success"
          />
          <EnhancedDashboardCard
            title="With Violations"
            value={stats.withViolations}
            icon={AlertTriangle}
            variant="warning"
          />
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Monthly OT Summary Report</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee, department, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleExportCSV}
                  disabled={isLoading || filteredData.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button 
                  onClick={handleExportPDF}
                  disabled={isLoading || filteredData.length === 0}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>

            <BODReportTable 
              data={filteredData}
              isLoading={isLoading}
            />
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
