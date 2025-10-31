import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/otCalculations';
import { useUpdateApprovalThreshold } from '@/hooks/hr/useUpdateApprovalThreshold';

interface ApprovalThreshold {
  id: string;
  threshold_name: string;
  daily_limit_hours: number;
  weekly_limit_hours: number;
  monthly_limit_hours: number;
  max_claimable_amount: number;
  auto_block_enabled: boolean;
  is_active: boolean;
  applies_to_department_ids: string[];
  applies_to_role_ids: string[];
}

interface ThresholdCardProps {
  threshold: ApprovalThreshold;
  onEdit: (threshold: ApprovalThreshold) => void;
  onDelete: (threshold: ApprovalThreshold) => void;
}

export function ThresholdCard({ threshold, onEdit, onDelete }: ThresholdCardProps) {
  const updateThreshold = useUpdateApprovalThreshold();

  const handleToggle = (checked: boolean) => {
    updateThreshold.mutate({
      id: threshold.id,
      is_active: checked,
    });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-foreground">{threshold.threshold_name}</h4>
          {threshold.auto_block_enabled && (
            <Badge variant="destructive" className="text-xs">Auto-block Enabled</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={threshold.is_active ? 'default' : 'secondary'}>
            {threshold.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(threshold)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(threshold)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Switch
            checked={threshold.is_active}
            onCheckedChange={handleToggle}
            disabled={updateThreshold.isPending}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Daily Limit</p>
          <p className="text-sm font-semibold">{threshold.daily_limit_hours} hours</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Weekly Limit</p>
          <p className="text-sm font-semibold">{threshold.weekly_limit_hours} hours</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Monthly Limit</p>
          <p className="text-sm font-semibold">{threshold.monthly_limit_hours} hours</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Max Claimable</p>
          <p className="text-sm font-semibold">{formatCurrency(threshold.max_claimable_amount)}</p>
        </div>
      </div>
    </Card>
  );
}
