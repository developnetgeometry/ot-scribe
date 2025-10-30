import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ThresholdsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Approval Thresholds</h3>
          <p className="text-sm text-muted-foreground">
            Set daily, weekly, and monthly OT limits
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Threshold
        </Button>
      </div>
      <div className="text-center py-8 text-muted-foreground">
        Thresholds configuration coming soon
      </div>
    </div>
  );
}
