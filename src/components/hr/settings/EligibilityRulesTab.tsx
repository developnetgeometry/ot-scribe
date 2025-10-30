import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EligibilityRulesTable } from './EligibilityRulesTable';
import { useEligibilityRules } from '@/hooks/hr/useEligibilityRules';

export function EligibilityRulesTab() {
  const { data: rules, isLoading } = useEligibilityRules();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">OT Eligibility Rules</h3>
          <p className="text-sm text-muted-foreground">
            Define who is eligible for overtime based on salary, department, and role
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <EligibilityRulesTable rules={rules || []} isLoading={isLoading} />
    </div>
  );
}
