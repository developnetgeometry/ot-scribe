import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatHours } from '@/lib/otCalculations';
import { ArrowUpDown, ArrowUp, ArrowDown, FileDown } from 'lucide-react';
import { generatePayslipPDF } from '@/lib/payslipPdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface EmployeeOTSummary {
  employee_no: string;
  employee_name: string;
  department: string;
  position: string;
  total_ot_hours: number;
  amount: number;
  monthly_total: number;
}

interface BODReportTableProps {
  data: EmployeeOTSummary[];
  isLoading: boolean;
  selectedMonth: Date;
}

type SortColumn = keyof EmployeeOTSummary;
type SortDirection = 'asc' | 'desc';

export function BODReportTable({ data, isLoading, selectedMonth }: BODReportTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('employee_no');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleDownloadPayslip = async (employeeNo: string) => {
    try {
      toast({
        title: 'Generating payslip...',
        description: 'Please wait while we prepare the PDF.'
      });

      // Get employee data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          employee_id,
          full_name,
          ic_no,
          department_id,
          position_id,
          departments(name),
          positions(title)
        `)
        .eq('employee_id', employeeNo)
        .single();

      if (profileError) throw profileError;

      // Get company data
      const { data: company, error: companyError } = await supabase
        .from('company_profile')
        .select('*')
        .single();

      if (companyError) throw companyError;

      // Get OT requests for the month
      const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

      const { data: otRequests, error: otError } = await supabase
        .from('ot_requests')
        .select('*')
        .eq('employee_id', profile.id)
        .gte('ot_date', startDate)
        .lte('ot_date', endDate)
        .in('status', ['approved', 'reviewed']);

      if (otError) throw otError;

      // Aggregate OT data
      const totalHours = otRequests?.reduce((sum, req) => sum + (req.total_hours || 0), 0) || 0;
      const totalAmount = otRequests?.reduce((sum, req) => sum + (req.ot_amount || 0), 0) || 0;

      // Format data for PDF generator
      const payslipData = {
        company: {
          name: company.name || 'Company Name',
          registration_no: company.registration_no || 'N/A',
          address: company.address || 'N/A',
          phone: company.phone || 'N/A',
          logo_url: company.logo_url || null
        },
        employee: {
          employee_no: employeeNo,
          full_name: profile.full_name,
          ic_no: profile.ic_no || null,
          department: profile.departments?.name || 'N/A',
          position: profile.positions?.title || 'N/A'
        },
        period: {
          display: format(selectedMonth, 'MMMM yyyy'),
          month: selectedMonth.getMonth() + 1,
          year: selectedMonth.getFullYear()
        },
        overtime: {
          amount: totalAmount,
          hours: totalHours
        }
      };

      // Generate PDF
      generatePayslipPDF(payslipData);

      toast({
        title: 'Payslip generated',
        description: 'PDF has been downloaded successfully.'
      });

    } catch (error) {
      console.error('Error generating payslip:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate payslip. Please try again.',
        variant: 'destructive'
      });
    }
  };


  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * modifier;
    }
    
    return String(aVal).localeCompare(String(bVal)) * modifier;
  });

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 inline" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 inline" />
      : <ArrowDown className="ml-2 h-4 w-4 inline" />;
  };

  // Calculate totals
  const totalHours = data.reduce((sum, row) => sum + row.total_ot_hours, 0);
  const totalCost = data.reduce((sum, row) => sum + row.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading report...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 border rounded-lg">
        <p className="text-muted-foreground">No overtime data for the selected period</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 font-semibold"
              onClick={() => handleSort('employee_no')}
            >
              Employee No. <SortIcon column="employee_no" />
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 font-semibold"
              onClick={() => handleSort('employee_name')}
            >
              Name <SortIcon column="employee_name" />
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 font-semibold"
              onClick={() => handleSort('department')}
            >
              Department <SortIcon column="department" />
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 font-semibold"
              onClick={() => handleSort('position')}
            >
              Position <SortIcon column="position" />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 font-semibold"
              onClick={() => handleSort('total_ot_hours')}
            >
              Total OT Hours <SortIcon column="total_ot_hours" />
            </TableHead>
            <TableHead className="text-right font-semibold">Amount (RM)</TableHead>
            <TableHead className="text-right font-semibold">Monthly Total (RM)</TableHead>
            <TableHead className="text-center font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={`${row.employee_no}-${index}`}>
              <TableCell className="font-semibold">
                {row.employee_no}
              </TableCell>
              <TableCell>{row.employee_name}</TableCell>
              <TableCell>{row.department}</TableCell>
              <TableCell>{row.position}</TableCell>
              <TableCell className="font-semibold text-primary">
                {formatHours(row.total_ot_hours)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(row.amount)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(row.monthly_total)}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPayslip(row.employee_no)}
                >
                  <FileDown className="h-4 w-4 mr-1" />
                  Payslip
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-muted/50">
            <TableCell colSpan={4} className="font-semibold">
              Total (All Employees)
            </TableCell>
            <TableCell className="font-bold text-primary">
              {formatHours(totalHours)} hrs
            </TableCell>
            <TableCell className="text-right font-bold text-primary">
              {formatCurrency(totalCost)}
            </TableCell>
            <TableCell className="text-right font-bold text-primary">
              {formatCurrency(totalCost)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
