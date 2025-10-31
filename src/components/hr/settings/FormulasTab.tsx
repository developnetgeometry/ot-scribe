import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRateFormulas } from '@/hooks/hr/useRateFormulas';
import { useDeleteRateFormula } from '@/hooks/hr/useDeleteRateFormula';
import { useCreateRateFormula } from '@/hooks/hr/useCreateRateFormula';
import { FormulaCard } from './FormulaCard';
import { FormulaDialog } from './FormulaDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const createFormula = useCreateRateFormula();
  const [formulaToDelete, setFormulaToDelete] = useState<any>(null);
  const [formulaToEdit, setFormulaToEdit] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeDayType, setActiveDayType] = useState<string>('weekday');

  const handleDelete = () => {
    if (formulaToDelete) {
      deleteFormula.mutate(formulaToDelete.id);
      setFormulaToDelete(null);
    }
  };

  const handleEdit = (formula: any) => {
    setFormulaToEdit(formula);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setFormulaToEdit(null);
    setIsDialogOpen(true);
  };

  const handleDuplicate = (formula: any) => {
    createFormula.mutate({
      formula_name: `${formula.formula_name} (Copy)`,
      day_type: formula.day_type,
      multiplier: formula.multiplier,
      base_formula: formula.base_formula,
      is_active: false,
      effective_from: new Date().toISOString().split('T')[0],
      employee_category: formula.employee_category,
      conditional_logic: formula.conditional_logic,
    });
  };

  const filteredFormulas = formulas?.filter(f => f.day_type === activeDayType) || [];

  const formatTabLabel = (dayType: string) => {
    return dayType === 'public_holiday' ? 'Public Holiday' : 
           dayType.charAt(0).toUpperCase() + dayType.slice(1);
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
        <Button onClick={handleAddNew} className="bg-[#5F26B4] hover:bg-[#5F26B4]/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Formula
        </Button>
      </div>

      <Tabs 
        value={activeDayType} 
        onValueChange={setActiveDayType}
        className="mt-4"
      >
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-background border border-border">
          <TabsTrigger 
            value="weekday"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#5F26B4] rounded-none"
          >
            Weekday
          </TabsTrigger>
          <TabsTrigger 
            value="saturday"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#5F26B4] rounded-none"
          >
            Saturday
          </TabsTrigger>
          <TabsTrigger 
            value="sunday"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#5F26B4] rounded-none"
          >
            Sunday
          </TabsTrigger>
          <TabsTrigger 
            value="public_holiday"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#5F26B4] rounded-none"
          >
            Public Holiday
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4 mt-5">
        {isLoading ? (
          <>
            <Skeleton className="h-48 w-full" />
          </>
        ) : filteredFormulas.length > 0 ? (
          filteredFormulas.map((formula) => (
            <FormulaCard
              key={formula.id}
              formula={formula}
              onEdit={handleEdit}
              onDelete={setFormulaToDelete}
              onDuplicate={handleDuplicate}
            />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-base">No {formatTabLabel(activeDayType)} formulas found.</p>
            <p className="text-sm mt-2">Click "Add Formula" to create one.</p>
          </div>
        )}
      </div>

      <FormulaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formula={formulaToEdit}
        onSuccess={() => {
          setIsDialogOpen(false);
          setFormulaToEdit(null);
        }}
      />

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
