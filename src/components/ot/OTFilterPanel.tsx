import { Search, X, Calendar, Clock, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useOTFilters } from '@/hooks/useOTFilters';
import { DayType } from '@/types/otms';

interface OTFilterPanelProps {
  filters: ReturnType<typeof useOTFilters>['filters'];
  updateFilter: ReturnType<typeof useOTFilters>['updateFilter'];
  clearFilters: ReturnType<typeof useOTFilters>['clearFilters'];
  applyDatePreset: ReturnType<typeof useOTFilters>['applyDatePreset'];
  activeFilterCount: number;
}

const statusOptions = [
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'supervisor_verified', label: 'Supervisor Verified' },
  { value: 'hr_certified', label: 'HR Certified' },
  { value: 'management_approved', label: 'Management Approved' },
  { value: 'pending_hr_recertification', label: 'Pending HR Recertification' },
  { value: 'rejected', label: 'Rejected' },
];

const dayTypeOptions: { value: DayType; label: string }[] = [
  { value: 'weekday', label: 'Weekday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'public_holiday', label: 'Public Holiday' },
];

const datePresets = [
  { value: 'today', label: 'Today' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisYear', label: 'This Year' },
];

export function OTFilterPanel({
  filters,
  updateFilter,
  clearFilters,
  applyDatePreset,
  activeFilterCount,
}: OTFilterPanelProps) {
  const handleStatusToggle = (value: string) => {
    const newStatus = filters.status.includes(value)
      ? filters.status.filter(s => s !== value)
      : [...filters.status, value];
    updateFilter('status', newStatus);
  };

  const handleDayTypeToggle = (value: DayType) => {
    const newDayType = filters.dayType.includes(value)
      ? filters.dayType.filter(d => d !== value)
      : [...filters.dayType, value];
    updateFilter('dayType', newDayType);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Ticket Number Search */}
      <div className="space-y-2">
        <Label htmlFor="ticket-search">Ticket Number</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="ticket-search"
            placeholder="Search by ticket number..."
            value={filters.ticketNumber || ''}
            onChange={(e) => updateFilter('ticketNumber', e.target.value || undefined)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Date Range Section */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center gap-2 font-medium text-sm hover:text-primary">
          <Calendar className="h-4 w-4" />
          Date Range
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          <div className="flex flex-wrap gap-2">
            {datePresets.map((preset) => (
              <Button
                key={preset.value}
                variant="outline"
                size="sm"
                onClick={() => applyDatePreset(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date">From</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">To</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Status Filter */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center gap-2 font-medium text-sm hover:text-primary">
          Status ({filters.status.length} selected)
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-3">
          {statusOptions.map((status) => (
            <div key={status.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status.value}`}
                checked={filters.status.includes(status.value)}
                onCheckedChange={() => handleStatusToggle(status.value)}
              />
              <Label
                htmlFor={`status-${status.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {status.label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Day Type Filter */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center gap-2 font-medium text-sm hover:text-primary">
          Day Type ({filters.dayType.length} selected)
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-3">
          {dayTypeOptions.map((dayType) => (
            <div key={dayType.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${dayType.value}`}
                checked={filters.dayType.includes(dayType.value)}
                onCheckedChange={() => handleDayTypeToggle(dayType.value)}
              />
              <Label
                htmlFor={`day-${dayType.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {dayType.label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Hours Range */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 font-medium text-sm hover:text-primary">
          <Clock className="h-4 w-4" />
          Hours Range
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="min-hours">Min Hours</Label>
              <Input
                id="min-hours"
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                value={filters.minHours ?? ''}
                onChange={(e) => updateFilter('minHours', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-hours">Max Hours</Label>
              <Input
                id="max-hours"
                type="number"
                min="0"
                step="0.5"
                placeholder="24"
                value={filters.maxHours ?? ''}
                onChange={(e) => updateFilter('maxHours', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Amount Range */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 font-medium text-sm hover:text-primary">
          <DollarSign className="h-4 w-4" />
          Amount Range
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="min-amount">Min Amount</Label>
              <Input
                id="min-amount"
                type="number"
                min="0"
                step="10"
                placeholder="0"
                value={filters.minAmount ?? ''}
                onChange={(e) => updateFilter('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-amount">Max Amount</Label>
              <Input
                id="max-amount"
                type="number"
                min="0"
                step="10"
                placeholder="10000"
                value={filters.maxAmount ?? ''}
                onChange={(e) => updateFilter('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
