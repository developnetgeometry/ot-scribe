import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserPlus, FileText, Briefcase, RefreshCcw } from 'lucide-react';
import { usePendingRecertifications } from '@/hooks/hr/useRecertifyOT';

export function QuickActions() {
  const navigate = useNavigate();
  const { data: pendingRecerts = [] } = usePendingRecertifications();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-4">
        <Button 
          onClick={() => navigate('/hr/employees')} 
          className="gap-2 h-auto py-4"
        >
          <UserPlus className="h-5 w-5" />
          <span>Add New Employee</span>
        </Button>
        {pendingRecerts.length > 0 && (
          <Button 
            onClick={() => navigate('/hr/recertify')} 
            variant="default"
            className="gap-2 h-auto py-4 relative"
          >
            <RefreshCcw className="h-5 w-5" />
            <span>Recertify OT ({pendingRecerts.length})</span>
          </Button>
        )}
        <Button 
          onClick={() => navigate('/hr/ot-reports')} 
          variant="outline" 
          className="gap-2 h-auto py-4"
        >
          <FileText className="h-5 w-5" />
          <span>View OT Reports</span>
        </Button>
        <Button 
          onClick={() => navigate('/hr/departments')} 
          variant="outline" 
          className="gap-2 h-auto py-4"
        >
          <Briefcase className="h-5 w-5" />
          <span>Manage Departments</span>
        </Button>
      </div>
    </div>
  );
}
