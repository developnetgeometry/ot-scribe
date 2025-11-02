import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { formatCurrency, formatHours } from '@/lib/otCalculations';
import { ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmployeeOTSummary {
  employee_no: string;
  employee_name: string;
  department: string;
  position: string;
  total_ot_hours: number;
  amount: number;
  monthly_total: number;
  status_summary: 'pending_bod_review' | 'bod_approved' | 'mixed';
  approved_count?: number;
  reviewed_count?: number;
}

interface BODReportTableProps {
  data: EmployeeOTSummary[];
  isLoading: boolean;
}

type SortColumn = keyof EmployeeOTSummary;
type SortDirection = 'asc' | 'desc';

export function BODReportTable({ data, isLoading }: BODReportTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('employee_no');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const StatusBadge = ({ status, approvedCount, reviewedCount }: { 
    status: 'pending_bod_review' | 'bod_approved' | 'mixed';
    approvedCount?: number;
    reviewedCount?: number;
  }) => {
    switch (status) {
      case 'pending_bod_review':
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending BOD Review
          </Badge>
        );
      case 'bod_approved':
        return (
          <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            BOD Approved
          </Badge>
        );
      case 'mixed':
        return (
          <div className="flex flex-col gap-1">
            <Badge className="bg-info/10 text-info border-info/20 hover:bg-info/20 text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Mixed Status
            </Badge>
            <span className="text-xs text-muted-foreground">
              {approvedCount} pending, {reviewedCount} approved
            </span>
          </div>
        );
      default:
        return null;
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
            <TableHead className="font-semibold">
              Status
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 font-semibold"
              onClick={() => handleSort('total_ot_hours')}
            >
              Total OT Hours <SortIcon column="total_ot_hours" />
            </TableHead>
            <TableHead className="text-right font-semibold">Amount (RM)</TableHead>
            <TableHead className="text-right font-semibold">Monthly Total (RM)</TableHead>
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
              <TableCell>
                <StatusBadge 
                  status={row.status_summary} 
                  approvedCount={row.approved_count}
                  reviewedCount={row.reviewed_count}
                />
              </TableCell>
              <TableCell className="font-semibold text-primary">
                {formatHours(row.total_ot_hours)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(row.amount)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(row.monthly_total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-muted/50">
            <TableCell colSpan={5} className="font-semibold">
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
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
