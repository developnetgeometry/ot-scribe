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
import { useEmployees } from '@/hooks/hr/useEmployees';
import { formatCurrency } from '@/lib/otCalculations';

interface EmployeeDetailsSheetProps {
  employee: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'edit';
}

const roles: AppRole[] = ['employee', 'supervisor', 'hr', 'bod', 'admin'];
const employmentTypes = ['Permanent', 'Contract', 'Internship'];
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
  const { data: employees = [] } = useEmployees();

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
      <SheetContent className="overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Employee Details</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Edit employee information' : 'View employee information'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Row 1: Employee No + Full Name */}
            <div className="grid gap-2">
              <Label>Employee No</Label>
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
                  placeholder="Enter Full Name"
                  required
                />
              ) : (
                <div className="text-sm">{employee.full_name}</div>
              )}
            </div>

            {/* Row 2: IC/Passport No + Email */}
            <div className="grid gap-2">
              <Label htmlFor="ic_no">IC/Passport No</Label>
              {isEditing ? (
                <Input
                  id="ic_no"
                  value={formData.ic_no || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, ic_no: e.target.value })
                  }
                  placeholder="e.g. 900101-10-1234"
                />
              ) : (
                <div className="text-sm">{employee.ic_no || '-'}</div>
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
                  placeholder="Enter Email"
                  required
                />
              ) : (
                <div className="text-sm">{employee.email}</div>
              )}
            </div>

            {/* Row 3: Phone No + Position */}
            <div className="grid gap-2">
              <Label htmlFor="phone_no">Phone No</Label>
              {isEditing ? (
                <Input
                  id="phone_no"
                  value={formData.phone_no || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_no: e.target.value })
                  }
                  placeholder="e.g. 012-3456789"
                />
              ) : (
                <div className="text-sm">{employee.phone_no || '-'}</div>
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
                  placeholder="e.g. Technician / Engineer"
                />
              ) : (
                <div className="text-sm">{employee.position || '-'}</div>
              )}
            </div>

            {/* Row 4: Department + Basic Salary */}
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              {isEditing ? (
                <Select
                  value={formData.department_id || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department_id: value })
                  }
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select Department" />
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
              <Label htmlFor="basic_salary">Basic Salary (RM)</Label>
              {isEditing ? (
                <Input
                  id="basic_salary"
                  type="number"
                  step="0.01"
                  value={formData.basic_salary || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basic_salary: parseFloat(e.target.value),
                    })
                  }
                  placeholder="e.g. 3000"
                  required
                />
              ) : (
                <div className="text-sm">{formatCurrency(employee.basic_salary)}</div>
              )}
            </div>

            {/* Row 5: EPF No + SOCSO No */}
            <div className="grid gap-2">
              <Label htmlFor="epf_no">EPF No</Label>
              {isEditing ? (
                <Input
                  id="epf_no"
                  value={formData.epf_no || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, epf_no: e.target.value })
                  }
                  placeholder="Enter EPF No"
                />
              ) : (
                <div className="text-sm">{employee.epf_no || '-'}</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="socso_no">SOCSO No</Label>
              {isEditing ? (
                <Input
                  id="socso_no"
                  value={formData.socso_no || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, socso_no: e.target.value })
                  }
                  placeholder="Enter SOCSO No"
                />
              ) : (
                <div className="text-sm">{employee.socso_no || '-'}</div>
              )}
            </div>

            {/* Row 6: Income Tax No + Employment Type */}
            <div className="grid gap-2">
              <Label htmlFor="income_tax_no">Income Tax No</Label>
              {isEditing ? (
                <Input
                  id="income_tax_no"
                  value={formData.income_tax_no || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, income_tax_no: e.target.value })
                  }
                  placeholder="Enter Income Tax No"
                />
              ) : (
                <div className="text-sm">{employee.income_tax_no || '-'}</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              {isEditing ? (
                <Select
                  value={formData.employment_type || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employment_type: value })
                  }
                >
                  <SelectTrigger id="employment_type">
                    <SelectValue placeholder="Select Type" />
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

            {/* Row 7: Joining Date + Work Location */}
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
              <Label htmlFor="work_location">Work Location</Label>
              {isEditing ? (
                <Input
                  id="work_location"
                  value={formData.work_location || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, work_location: e.target.value })
                  }
                  placeholder="e.g. HQ, Site A"
                />
              ) : (
                <div className="text-sm">{employee.work_location || '-'}</div>
              )}
            </div>

            {/* Row 8: State + Reporting To */}
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              {isEditing ? (
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="e.g. Selangor"
                />
              ) : (
                <div className="text-sm">{employee.state || '-'}</div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supervisor_id">Reporting To</Label>
              {isEditing ? (
                <Select
                  value={formData.supervisor_id || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, supervisor_id: value })
                  }
                >
                  <SelectTrigger id="supervisor_id">
                    <SelectValue placeholder="Select Supervisor (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => emp.user_roles?.some(r => ['supervisor', 'hr', 'admin'].includes(r.role)))
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm">
                  {employees.find((e) => e.id === employee.supervisor_id)?.full_name || '-'}
                </div>
              )}
            </div>

            {/* Row 9: Role + Status */}
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

            {/* Row 10: OT Eligible (Full Width) */}
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="is_ot_eligible">OT Eligible</Label>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_ot_eligible"
                    checked={formData.is_ot_eligible ?? true}
                    onChange={(e) =>
                      setFormData({ ...formData, is_ot_eligible: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-muted-foreground">
                    Allow employee to submit overtime requests
                  </span>
                </div>
              ) : (
                <Badge variant={employee.is_ot_eligible ? 'default' : 'secondary'} className="w-fit">
                  {employee.is_ot_eligible ? 'Yes' : 'No'}
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
