import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useInviteEmployee } from '@/hooks/hr/useInviteEmployee';
import { useDepartments } from '@/hooks/hr/useDepartments';
import { useEmployees } from '@/hooks/hr/useEmployees';

const inviteSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  full_name: z.string().trim().min(1, 'Full name is required').max(100),
  employee_id: z.string().trim().min(1, 'Employee No is required').max(50),
  ic_no: z.string().trim().max(50).optional(),
  phone_no: z.string().trim().max(20).optional(),
  position: z.string().trim().min(1, 'Position is required').max(100),
  department_id: z.string().uuid('Department is required'),
  basic_salary: z.number().min(1, 'Basic salary must be greater than 0'),
  epf_no: z.string().trim().max(50).optional(),
  socso_no: z.string().trim().max(50).optional(),
  income_tax_no: z.string().trim().max(50).optional(),
  employment_type: z.string().min(1, 'Employment type is required'),
  joining_date: z.string().min(1, 'Joining date is required'),
  work_location: z.string().trim().min(1, 'Work location is required').max(100),
  supervisor_id: z.string().uuid().optional().or(z.literal('')),
  role: z.enum(['employee', 'supervisor', 'hr', 'bod', 'admin']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteEmployeeDialog({ open, onOpenChange }: InviteEmployeeDialogProps) {
  const { mutate: inviteEmployee, isPending } = useInviteEmployee();
  const { data: departments = [] } = useDepartments();
  const { data: employees = [] } = useEmployees();
  
  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'employee',
      employment_type: 'Permanent',
      supervisor_id: '',
    },
  });

  const onSubmit = (data: InviteFormData) => {
    inviteEmployee({
      email: data.email,
      full_name: data.full_name,
      employee_id: data.employee_id,
      ic_no: data.ic_no || null,
      phone_no: data.phone_no || null,
      position: data.position,
      department_id: data.department_id,
      basic_salary: data.basic_salary,
      epf_no: data.epf_no || null,
      socso_no: data.socso_no || null,
      income_tax_no: data.income_tax_no || null,
      employment_type: data.employment_type,
      joining_date: data.joining_date,
      work_location: data.work_location,
      supervisor_id: data.supervisor_id || null,
      role: data.role,
    }, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1: Employee No & Full Name */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee No *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. EMP001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: IC/Passport & Email */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ic_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IC/Passport No</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 900101-10-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g. employee@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: Phone & Position */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone No</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 012-3456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Technician / Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 4: Department & Basic Salary */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="basic_salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Basic Salary (RM) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 3000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 5: EPF & SOCSO */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="epf_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EPF No</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter EPF No" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socso_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SOCSO No</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SOCSO No" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 6: Income Tax & Employment Type */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="income_tax_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Income Tax No</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Income Tax No" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 7: Joining Date & Work Location */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="joining_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joining Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="work_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. HQ, Site A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 8: Reporting To (Full Width) */}
            <FormField
              control={form.control}
              name="supervisor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reporting To</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Supervisor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {employees
                        .filter(emp => emp.user_roles?.some(r => ['supervisor', 'hr', 'admin'].includes(r.role)))
                        .map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.full_name} ({emp.employee_id})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 9: Role (Full Width) */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="bod">BOD</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Adding...' : 'Add Employee'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
