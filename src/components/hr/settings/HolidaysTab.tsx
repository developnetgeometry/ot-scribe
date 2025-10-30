import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function HolidaysTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Public Holidays</h3>
          <p className="text-sm text-muted-foreground">
            Manage public holiday calendar
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Holiday
        </Button>
      </div>
      <div className="text-center py-8 text-muted-foreground">
        Holidays configuration coming soon
      </div>
    </div>
  );
}
