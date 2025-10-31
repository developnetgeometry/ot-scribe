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
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useCreatePosition } from '@/hooks/hr/useCreatePosition';
import { useUpdatePosition } from '@/hooks/hr/useUpdatePosition';
import { Position } from '@/hooks/hr/usePositions';

const positionSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
});

type PositionFormData = z.infer<typeof positionSchema>;

interface PositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  position?: Position | null;
}

export function PositionDialog({ open, onOpenChange, departmentId, position }: PositionDialogProps) {
  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition();
  const isEditing = !!position;

  const form = useForm<PositionFormData>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      title: '',
      description: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (position) {
      form.reset({
        title: position.title,
        description: position.description || '',
        is_active: position.is_active,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        is_active: true,
      });
    }
  }, [position, form]);

  const onSubmit = async (data: PositionFormData) => {
    if (isEditing && position) {
      await updatePosition.mutateAsync({
        id: position.id,
        department_id: departmentId,
        title: data.title,
        description: data.description,
        is_active: data.is_active,
      });
    } else {
      await createPosition.mutateAsync({
        department_id: departmentId,
        title: data.title,
        description: data.description,
        is_active: data.is_active,
      });
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Position' : 'Add Position'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the position details below.' : 'Create a new position for this department.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the position..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Inactive positions won't be available for new assignments
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPosition.isPending || updatePosition.isPending}
              >
                {isEditing ? 'Update' : 'Create'} Position
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
