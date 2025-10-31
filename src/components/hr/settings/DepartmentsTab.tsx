import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useDepartments } from '@/hooks/hr/useDepartments';
import { DepartmentCard } from '@/components/hr/departments/DepartmentCard';
import { DepartmentDialog } from '@/components/hr/departments/DepartmentDialog';
import { Skeleton } from '@/components/ui/skeleton';

export function DepartmentsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const { data: departments, isLoading } = useDepartments();

  const filteredDepartments = departments?.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (department: any) => {
    setSelectedDepartment(department);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Departments</h3>
          <p className="text-sm text-muted-foreground">
            Manage organization departments ({departments?.length || 0} total)
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDepartments?.map((dept) => (
            <DepartmentCard 
              key={dept.id} 
              department={dept} 
              onEdit={handleEdit}
              onViewDetails={() => {}} // No-op in settings tab, users can go to main Departments page
            />
          ))}
          {filteredDepartments?.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No departments found
            </div>
          )}
        </div>
      )}

      <DepartmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={selectedDepartment}
      />
    </div>
  );
}
