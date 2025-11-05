import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, DollarSign, Clock, AlertTriangle, FileCheck, Download, FileText, Filter } from 'lucide-react';
import { EnhancedDashboardCard } from '@/components/hr/EnhancedDashboardCard';
import { HRReportTable } from '@/components/hr/reports/HRReportTable';
import { useHRReportData } from '@/hooks/useHRReportData';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils';
import { formatCurrency, formatHours } from '@/lib/otCalculations';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function OTReports() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentDate.getFullYear().toString());
  const [appliedMonth, setAppliedMonth] = useState<string>((currentDate.getMonth() + 1).toString());
  const [appliedYear, setAppliedYear] = useState<string>(currentDate.getFullYear().toString());
  
  const filterDate = useMemo(() => {
    return new Date(parseInt(appliedYear), parseInt(appliedMonth) - 1, 1);
  }, [appliedMonth, appliedYear]);
  
  const { data, isLoading } = useHRReportData(filterDate);

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

    const monthStr = format(filterDate, 'MMM_yyyy');
    exportToCSV(formattedData, `HR_OT_Report_${monthStr}`, headers);
    
    toast({
      title: 'Report exported',
      description: 'Excel file has been downloaded successfully.'
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
          <h1 className="text-3xl font-bold">OT Reports</h1>
          <p className="text-muted-foreground">Filter and export monthly overtime summaries by department and employee.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedDashboardCard
            title="Pending Review"
            value={stats.pendingReview}
            icon={FileCheck}
            variant="primary"
            subtitle="Awaiting HR review"
          />
          <EnhancedDashboardCard
            title="Total OT Hours"
            value={formatHours(stats.totalHours)}
            icon={Clock}
            variant="info"
            subtitle="Total approved hours this month"
          />
          <EnhancedDashboardCard
            title="Total OT Cost"
            value={formatCurrency(stats.totalCost)}
            icon={DollarSign}
            variant="success"
            subtitle="Total RM paid for overtime this month"
          />
          <EnhancedDashboardCard
            title="With Violations"
            value={stats.withViolations}
            icon={AlertTriangle}
            variant="warning"
            subtitle="Requests exceeding approval threshold"
          />
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Monthly OT Summary Report</h2>
              
              <div className="flex items-center gap-3">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px] border-[#E5E7EB] focus:border-[#5F26B4] focus:ring-[#5F26B4]">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50 border shadow-lg">
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px] border-[#E5E7EB] focus:border-[#5F26B4] focus:ring-[#5F26B4]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50 border shadow-lg">
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => {
                    setAppliedMonth(selectedMonth);
                    setAppliedYear(selectedYear);
                  }}
                  disabled={isLoading}
                  className="bg-[#5F26B4] hover:bg-[#4C1D95] text-white font-semibold px-5 transition-all duration-200"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filter
                </Button>
              </div>
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
                  Export Excel
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

            <HRReportTable 
              data={filteredData}
              isLoading={isLoading}
              selectedMonth={filterDate}
            />
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
