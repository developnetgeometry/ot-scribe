/**
 * Holiday Configuration Tab
 *
 * Allows HR admins to configure the company's Malaysian state
 * for holiday management (Story 7.1)
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { HolidayConfigService } from '@/services/HolidayConfigService';
import { getAllStates, getStateLabel, type MalaysianStateKey } from '@/config/malaysia-states';

const configService = new HolidayConfigService();

export function HolidayConfigTab() {
  const [selectedState, setSelectedState] = useState<MalaysianStateKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCurrentState();
  }, []);

  const loadCurrentState = async () => {
    try {
      const state = await configService.getCompanyState();
      if (state) {
        setSelectedState(state);
      }
    } catch (error) {
      console.error('Error loading state:', error);
      toast.error('Failed to load current configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedState) {
      toast.error('Please select a state');
      return;
    }

    setIsSaving(true);
    try {
      await configService.saveCompanyState(selectedState);
      const stateLabel = getStateLabel(selectedState);
      toast.success('Holiday configuration saved', {
        description: `State set to ${stateLabel}`,
      });
    } catch (error) {
      console.error('Error saving state:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Holiday Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure your company's location to manage Malaysian public holidays
        </p>
      </div>

      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="state" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Malaysian State/Territory
          </Label>
          <Select
            value={selectedState || undefined}
            onValueChange={(value) => setSelectedState(value as MalaysianStateKey)}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Select your company's state" />
            </SelectTrigger>
            <SelectContent>
              {getAllStates().map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            This determines which state-specific holidays will be included in your calendar
          </p>
        </div>

        {selectedState && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">Selected State:</p>
            <p className="text-sm text-muted-foreground">
              {getStateLabel(selectedState)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Your holiday calendar will include federal holidays and holidays specific to this state.
            </p>
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaving || !selectedState}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
}
