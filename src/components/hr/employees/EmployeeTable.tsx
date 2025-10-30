import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Mail } from 'lucide-react';
import { formatCurrency } from '@/lib/otCalculations';
import { EmployeeDetailsSheet } from './EmployeeDetailsSheet';
import { Profile } from '@/types/otms';
import { useResendInvite } from '@/hooks/hr/useResendInvite';

interface EmployeeTableProps {
  employees: Profile[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: string;
}

export function EmployeeTable({ employees, isLoading, searchQuery, statusFilter }: EmployeeTableProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null);
  const [sheetMode, setSheetMode] = useState<'view' | 'edit'>('view');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const resendInvite = useResendInvite();

  // Filter employees based on search and status
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchQuery === '' || 
      employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      employee.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleResendInvite = (employee: Profile) => {
    resendInvite.mutate({
      userId: employee.id,
      email: employee.email
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (filteredEmployees.length === 0) {
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
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-mono text-sm">{employee.employee_id}</TableCell>
              <TableCell className="font-medium">{employee.full_name}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>
                {employee.department?.name || '-'}
              </TableCell>
              <TableCell>
                <Badge 
                  className={
                    employee.status === 'active' 
                      ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                      : employee.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                  }
                >
                  {employee.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setSheetMode('view');
                      setIsSheetOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setSheetMode('edit');
                      setIsSheetOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {(employee.status === 'pending' || employee.status === 'inactive') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResendInvite(employee)}
                      disabled={resendInvite.isPending}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EmployeeDetailsSheet
        employee={selectedEmployee}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        mode={sheetMode}
      />
    </div>
  );
}
