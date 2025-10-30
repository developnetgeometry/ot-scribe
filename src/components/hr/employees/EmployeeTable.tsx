import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/otCalculations';

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department_id: string | null;
  basic_salary: number;
  designation: string | null;
  status: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
}

export function EmployeeTable({ employees, isLoading }: EmployeeTableProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No employees found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee ID</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Basic Salary</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-mono text-sm">{employee.employee_id}</TableCell>
              <TableCell className="font-medium">{employee.full_name}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.designation || '-'}</TableCell>
              <TableCell>{formatCurrency(employee.basic_salary)}</TableCell>
              <TableCell>
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
