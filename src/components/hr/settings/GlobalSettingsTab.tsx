import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function GlobalSettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Global OT Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure system-wide overtime settings
        </p>
      </div>

      <div className="space-y-4 max-w-xl">
        <div>
          <Label>Salary Threshold (RM)</Label>
          <Input type="number" defaultValue="4000" />
          <p className="text-xs text-muted-foreground mt-1">
            Employees below this salary get different OT rates
          </p>
        </div>

        <div>
          <Label>Max Daily Hours</Label>
          <Input type="number" defaultValue="12" />
        </div>

        <div>
          <Label>Submission Limit (Days)</Label>
          <Input type="number" defaultValue="3" />
          <p className="text-xs text-muted-foreground mt-1">
            How many days back employees can submit OT requests
          </p>
        </div>

        <Button>Save Settings</Button>
      </div>
    </div>
  );
}
