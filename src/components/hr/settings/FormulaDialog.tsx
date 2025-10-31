import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateRateFormula } from '@/hooks/hr/useCreateRateFormula';
import { useUpdateRateFormula } from '@/hooks/hr/useUpdateRateFormula';

const formulaSchema = z.object({
  formula_name: z.string().min(1, 'Formula name is required').max(100),
  day_type: z.enum(['weekday', 'saturday', 'sunday', 'public_holiday']),
  multiplier: z.coerce.number().min(0, 'Multiplier must be positive'),
  base_formula: z.string().min(1, 'Base formula is required'),
  employee_category: z.string().min(1, 'Employee category is required'),
  is_active: z.boolean().default(true),
  effective_from: z.string().min(1, 'Effective date is required'),
});

type FormulaFormValues = z.infer<typeof formulaSchema>;

interface FormulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formula?: any;
  onSuccess?: () => void;
}

export function FormulaDialog({ open, onOpenChange, formula, onSuccess }: FormulaDialogProps) {
  const isEditing = !!formula;
  const createFormula = useCreateRateFormula();
  const updateFormula = useUpdateRateFormula();

  const form = useForm<FormulaFormValues>({
    resolver: zodResolver(formulaSchema),
    defaultValues: {
      formula_name: '',
      day_type: 'weekday',
      multiplier: 1.5,
      base_formula: 'hourly_rate',
      employee_category: 'All',
      is_active: true,
      effective_from: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (formula) {
      form.reset({
        formula_name: formula.formula_name,
        day_type: formula.day_type,
        multiplier: formula.multiplier,
        base_formula: formula.base_formula,
        employee_category: formula.employee_category || 'All',
        is_active: formula.is_active,
        effective_from: formula.effective_from,
      });
    } else {
      form.reset({
        formula_name: '',
        day_type: 'weekday',
        multiplier: 1.5,
        base_formula: 'hourly_rate',
        employee_category: 'All',
        is_active: true,
        effective_from: new Date().toISOString().split('T')[0],
      });
    }
  }, [formula, form]);

  const onSubmit = async (data: FormulaFormValues) => {
    if (isEditing) {
      updateFormula.mutate(
        { id: formula.id, ...data },
        {
          onSuccess: () => {
            onSuccess?.();
            handleClose();
          },
        }
      );
    } else {
      createFormula.mutate(
        {
          formula_name: data.formula_name,
          day_type: data.day_type,
          multiplier: data.multiplier,
          base_formula: data.base_formula,
          employee_category: data.employee_category,
          is_active: data.is_active,
          effective_from: data.effective_from,
        },
        {
          onSuccess: () => {
            onSuccess?.();
            handleClose();
          },
        }
      );
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Rate Formula' : 'Add Rate Formula'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the rate formula details below.'
              : 'Create a new rate formula for OT calculations.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="formula_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formula Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Standard Weekday OT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="day_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekday">Weekday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                        <SelectItem value="public_holiday">Public Holiday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="multiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Multiplier *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="1.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employee_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Category *</FormLabel>
                    <FormControl>
                      <Input placeholder="All" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effective_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective From *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this formula
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="base_formula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Formula *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., hourly_rate, daily_rate"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#5F26B4] hover:bg-[#5F26B4]/90"
                disabled={createFormula.isPending || updateFormula.isPending}
              >
                {createFormula.isPending || updateFormula.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Formula'
                  : 'Create Formula'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
