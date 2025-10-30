import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function FormulasTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">OT Rate Formulas</h3>
          <p className="text-sm text-muted-foreground">
            Configure calculation formulas for different day types
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Formula
        </Button>
      </div>
      <div className="text-center py-8 text-muted-foreground">
        Formulas configuration coming soon
      </div>
    </div>
  );
}
