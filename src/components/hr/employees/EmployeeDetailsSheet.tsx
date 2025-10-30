import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Profile, AppRole } from '@/types/otms';
import { useUpdateEmployee } from '@/hooks/hr/useUpdateEmployee';
import { useDepartments } from '@/hooks/hr/useDepartments';
import { formatCurrency } from '@/lib/otCalculations';

interface EmployeeDetailsSheetProps {
  employee: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'edit';
}

const roles: AppRole[] = ['employee', 'supervisor', 'hr', 'bod', 'admin'];
const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary'];
const statuses = ['active', 'inactive'];

export function EmployeeDetailsSheet({
  employee,
  open,
  onOpenChange,
  mode: initialMode,
}: EmployeeDetailsSheetProps) {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [selectedRole, setSelectedRole] = useState<AppRole>('employee');

  const updateEmployee = useUpdateEmployee();
  const { data: departments } = useDepartments();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
      setSelectedRole(
        employee.user_roles && employee.user_roles.length > 0
          ? employee.user_roles[0].role
          : 'employee'
      );
    }
  }, [employee]);

  if (!employee) return null;

  const handleSave = () => {
    updateEmployee.mutate(
      {
        id: employee.id,
        ...formData,
        role: selectedRole,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setFormData(employee);
    setMode('view');
  };

  const isEditing = mode === 'edit';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Employee Details</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Edit employee information' : 'View employee information'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Employee ID</Label>
              <div className="font-mono text-sm">{employee.employee_id}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="full_name"
                  value={formData.full_name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                />
              ) : (
                <div className="text-sm">{employee.full_name}</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              ) : (
                <div className="text-sm">{employee.email}</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              {isEditing ? (
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role} className="capitalize">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="w-fit capitalize">
                  {employee.user_roles && employee.user_roles.length > 0
                    ? employee.user_roles[0].role
                    : 'employee'}
                </Badge>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              {isEditing ? (
                <Select
                  value={formData.department_id || ''}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department_id: value })
                  }
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm">
                  {departments?.find((d) => d.id === employee.department_id)?.name || '-'}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="basic_salary">Basic Salary</Label>
              {isEditing ? (
                <Input
                  id="basic_salary"
                  type="number"
                  value={formData.basic_salary || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basic_salary: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              ) : (
                <div className="text-sm">{formatCurrency(employee.basic_salary)}</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              {isEditing ? (
                <Select
                  value={formData.employment_type || ''}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employment_type: value })
                  }
                >
                  <SelectTrigger id="employment_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm">{employee.employment_type || '-'}</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="designation">Designation</Label>
              {isEditing ? (
                <Input
                  id="designation"
                  value={formData.designation || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                />
              ) : (
                <div className="text-sm">{employee.designation || '-'}</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              {isEditing ? (
                <Input
                  id="position"
                  value={formData.position || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                />
              ) : (
                <div className="text-sm">{employee.position || '-'}</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="work_location">Work Location</Label>
              {isEditing ? (
                <Input
                  id="work_location"
                  value={formData.work_location || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, work_location: e.target.value })
                  }
                />
              ) : (
                <div className="text-sm">{employee.work_location || '-'}</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              {isEditing ? (
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              ) : (
                <div className="text-sm">{employee.state || '-'}</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="joining_date">Joining Date</Label>
              {isEditing ? (
                <Input
                  id="joining_date"
                  type="date"
                  value={formData.joining_date || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, joining_date: e.target.value })
                  }
                />
              ) : (
                <div className="text-sm">
                  {employee.joining_date
                    ? new Date(employee.joining_date).toLocaleDateString()
                    : '-'}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              {isEditing ? (
                <Select
                  value={formData.status || 'active'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  variant={employee.status === 'active' ? 'default' : 'secondary'}
                  className="w-fit"
                >
                  {employee.status}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateEmployee.isPending}>
                  {updateEmployee.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setMode('edit')}>Edit</Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
