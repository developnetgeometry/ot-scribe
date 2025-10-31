import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/otCalculations';
import { useUpdateEligibilityRule } from '@/hooks/hr/useUpdateEligibilityRule';

interface EligibilityRule {
  id: string;
  rule_name: string;
  min_salary: number;
  max_salary: number;
  is_active: boolean;
  department_ids: string[];
  role_ids: string[];
  employment_types: string[];
}

interface EligibilityRuleCardProps {
  rule: EligibilityRule;
  onEdit: (rule: EligibilityRule) => void;
  onDelete: (rule: EligibilityRule) => void;
}

export function EligibilityRuleCard({ rule, onEdit, onDelete }: EligibilityRuleCardProps) {
  const updateRule = useUpdateEligibilityRule();

  const handleToggle = (checked: boolean) => {
    updateRule.mutate({
      id: rule.id,
      is_active: checked,
    });
  };

  return (
    <Card className="p-6 flex justify-between items-center">
      <div className="space-y-1">
        <h4 className="text-base font-semibold text-foreground">{rule.rule_name}</h4>
        <p className="text-sm text-muted-foreground">
          Salary Range: {formatCurrency(rule.min_salary)} - {formatCurrency(rule.max_salary)}
        </p>
        <p className="text-xs text-muted-foreground">
          Employees within this salary range can submit OT requests
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
          {rule.is_active ? 'Active' : 'Inactive'}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(rule)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(rule)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Switch
          checked={rule.is_active}
          onCheckedChange={handleToggle}
          disabled={updateRule.isPending}
        />
      </div>
    </Card>
  );
}
