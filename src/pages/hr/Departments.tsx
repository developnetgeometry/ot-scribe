import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { useDepartments } from '@/hooks/hr/useDepartments';
import { DepartmentCard } from '@/components/hr/departments/DepartmentCard';
import { DepartmentTable } from '@/components/hr/departments/DepartmentTable';
import { DepartmentDialog } from '@/components/hr/departments/DepartmentDialog';
import { DepartmentStats } from '@/components/hr/departments/DepartmentStats';
import { Skeleton } from '@/components/ui/skeleton';

export default function Departments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const { data: departments, isLoading } = useDepartments();

  const filteredDepartments = departments?.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEmployees = departments?.reduce((sum, dept) => sum + (dept.employee_count || 0), 0) || 0;
  const emptyDepartments = departments?.filter((dept) => !dept.employee_count || dept.employee_count === 0).length || 0;
  const largestDepartment = departments?.reduce((max, dept) => {
    const count = dept.employee_count || 0;
    return count > (max?.count || 0) ? { name: dept.name, count } : max;
  }, null as { name: string; count: number } | null);

  const handleEdit = (department: any) => {
    setSelectedDepartment(department);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    setDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Departments</h1>
            <p className="text-muted-foreground">Manage organizational departments and structures</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <DepartmentStats
            totalDepartments={departments?.length || 0}
            totalEmployees={totalEmployees}
            largestDepartment={largestDepartment || undefined}
            emptyDepartments={emptyDepartments}
          />
        )}

        {/* Search and View Toggle */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDepartments?.map((dept) => (
              <DepartmentCard key={dept.id} department={dept} onEdit={handleEdit} />
            ))}
            {filteredDepartments?.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No departments found
              </div>
            )}
          </div>
        ) : (
          <DepartmentTable departments={filteredDepartments || []} onEdit={handleEdit} />
        )}
      </div>

      <DepartmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={selectedDepartment}
      />
    </AppLayout>
  );
}
