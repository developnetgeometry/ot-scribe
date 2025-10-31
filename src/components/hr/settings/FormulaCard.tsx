import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2 } from 'lucide-react';
import { useUpdateRateFormula } from '@/hooks/hr/useUpdateRateFormula';
import { format } from 'date-fns';

interface RateFormula {
  id: string;
  formula_name: string;
  day_type: string;
  multiplier: number;
  base_formula: string;
  is_active: boolean;
  effective_from: string;
  effective_to: string | null;
  employee_category: string;
}

interface FormulaCardProps {
  formula: RateFormula;
  onEdit: (formula: RateFormula) => void;
  onDelete: (formula: RateFormula) => void;
}

const dayTypeStyles: Record<string, { bg: string; text: string }> = {
  weekday: { bg: 'bg-blue-100', text: 'text-blue-800' },
  saturday: { bg: 'bg-purple-100', text: 'text-purple-800' },
  sunday: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  public_holiday: { bg: 'bg-red-100', text: 'text-red-800' },
};

export function FormulaCard({ formula, onEdit, onDelete }: FormulaCardProps) {
  const updateFormula = useUpdateRateFormula();

  const handleToggle = (checked: boolean) => {
    updateFormula.mutate({
      id: formula.id,
      is_active: checked,
    });
  };

  const dayTypeStyle = dayTypeStyles[formula.day_type] || { bg: 'bg-gray-100', text: 'text-gray-800' };

  return (
    <Card className="p-6 flex justify-between items-center">
      <div className="space-y-1">
        <h4 className="text-base font-semibold text-foreground">{formula.formula_name}</h4>
        <div className="flex items-center gap-2">
          <Badge className={`${dayTypeStyle.bg} ${dayTypeStyle.text}`} variant="outline">
            {formula.day_type.replace('_', ' ').toUpperCase()}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Multiplier: {formula.multiplier}x
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Formula: {formula.base_formula}
        </p>
        <p className="text-xs text-muted-foreground">
          Effective: {format(new Date(formula.effective_from), 'MMM dd, yyyy')}
          {formula.effective_to && ` - ${format(new Date(formula.effective_to), 'MMM dd, yyyy')}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={formula.is_active ? 'default' : 'secondary'}>
          {formula.is_active ? 'Active' : 'Inactive'}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(formula)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(formula)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Switch
          checked={formula.is_active}
          onCheckedChange={handleToggle}
          disabled={updateFormula.isPending}
        />
      </div>
    </Card>
  );
}
