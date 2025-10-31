import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRateFormulas } from '@/hooks/hr/useRateFormulas';
import { useDeleteRateFormula } from '@/hooks/hr/useDeleteRateFormula';
import { FormulaCard } from './FormulaCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function FormulasTab() {
  const { data: formulas, isLoading } = useRateFormulas();
  const deleteFormula = useDeleteRateFormula();
  const [formulaToDelete, setFormulaToDelete] = useState<any>(null);

  const handleDelete = () => {
    if (formulaToDelete) {
      deleteFormula.mutate(formulaToDelete.id);
      setFormulaToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">OT Rate Formulas</h3>
          <p className="text-sm text-muted-foreground">
            Configure calculation formulas for different day types
          </p>
        </div>
        <Button className="bg-[#5F26B4] hover:bg-[#5F26B4]/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Formula
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : formulas && formulas.length > 0 ? (
          formulas.map((formula) => (
            <FormulaCard
              key={formula.id}
              formula={formula}
              onEdit={() => {}}
              onDelete={setFormulaToDelete}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No rate formulas found. Click "Add Formula" to create one.
          </div>
        )}
      </div>

      <AlertDialog open={!!formulaToDelete} onOpenChange={() => setFormulaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rate Formula</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{formulaToDelete?.formula_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
