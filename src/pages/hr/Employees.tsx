import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Download } from 'lucide-react';
import { EmployeeTable } from '@/components/hr/employees/EmployeeTable';
import { InviteEmployeeDialog } from '@/components/hr/employees/InviteEmployeeDialog';
import { EmployeeStats } from '@/components/hr/employees/EmployeeStats';
import { useEmployees } from '@/hooks/hr/useEmployees';

export default function Employees() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { data: employees, isLoading } = useEmployees();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Employee Management</h1>
            <p className="text-muted-foreground">Manage employee profiles and roles</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Employee
            </Button>
          </div>
        </div>

        <EmployeeStats employees={employees || []} />

        <Card className="p-6">
          <EmployeeTable employees={employees || []} isLoading={isLoading} />
        </Card>

        <InviteEmployeeDialog 
          open={inviteDialogOpen} 
          onOpenChange={setInviteDialogOpen}
        />
      </div>
    </AppLayout>
  );
}
