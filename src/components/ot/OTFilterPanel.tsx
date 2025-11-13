import { useState } from 'react';
import { Search, X, Calendar, Clock, DollarSign, ChevronDown, Filter, CalendarDays, CalendarRange, CalendarClock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useOTFilters } from '@/hooks/useOTFilters';
import { DayType } from '@/types/otms';
import { cn } from '@/lib/utils';

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
  { value: 'today', label: 'Today', icon: CalendarDays, category: 'quick' },
  { value: 'last7days', label: 'Last 7 Days', icon: CalendarRange, category: 'quick' },
  { value: 'last30days', label: 'Last 30 Days', icon: CalendarRange, category: 'quick' },
  { value: 'thisMonth', label: 'This Month', icon: Calendar, category: 'monthly' },
  { value: 'lastMonth', label: 'Last Month', icon: Calendar, category: 'monthly' },
  { value: 'thisYear', label: 'This Year', icon: CalendarClock, category: 'yearly' },
];

export function OTFilterPanel({
  filters,
  updateFilter,
  clearFilters,
  applyDatePreset,
  activeFilterCount,
}: OTFilterPanelProps) {
  const [openSections, setOpenSections] = useState({
    dateRange: true,
    status: true,
    dayType: true,
    hours: false,
    amount: false,
  });

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

  const clearIndividualFilter = (filterKey: keyof typeof filters) => {
    if (filterKey === 'status') updateFilter('status', []);
    else if (filterKey === 'dayType') updateFilter('dayType', []);
    else if (filterKey === 'ticketNumber') updateFilter('ticketNumber', undefined);
    else if (filterKey === 'startDate' || filterKey === 'endDate') {
      updateFilter('startDate', undefined);
      updateFilter('endDate', undefined);
    } else if (filterKey === 'minHours' || filterKey === 'maxHours') {
      updateFilter('minHours', undefined);
      updateFilter('maxHours', undefined);
    } else if (filterKey === 'minAmount' || filterKey === 'maxAmount') {
      updateFilter('minAmount', undefined);
      updateFilter('maxAmount', undefined);
    }
  };

  const getActiveFilterBadges = () => {
    const badges: Array<{ label: string; key: keyof typeof filters }> = [];
    
    if (filters.ticketNumber) {
      badges.push({ label: `Ticket: ${filters.ticketNumber}`, key: 'ticketNumber' });
    }
    if (filters.startDate || filters.endDate) {
      badges.push({ 
        label: `Date: ${filters.startDate || '...'} to ${filters.endDate || '...'}`, 
        key: 'startDate' 
      });
    }
    if (filters.status.length > 0) {
      badges.push({ label: `Status: ${filters.status.length} selected`, key: 'status' });
    }
    if (filters.dayType.length > 0) {
      badges.push({ label: `Day Type: ${filters.dayType.length} selected`, key: 'dayType' });
    }
    if (filters.minHours !== undefined || filters.maxHours !== undefined) {
      badges.push({ 
        label: `Hours: ${filters.minHours ?? '0'} - ${filters.maxHours ?? '∞'}`, 
        key: 'minHours' 
      });
    }
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      badges.push({ 
        label: `Amount: ${filters.minAmount ?? '0'} - ${filters.maxAmount ?? '∞'}`, 
        key: 'minAmount' 
      });
    }
    
    return badges;
  };

  const activeFilterBadges = getActiveFilterBadges();

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="animate-fade-in">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {activeFilterBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {activeFilterBadges.map((badge, index) => (
            <Badge
              key={index}
              variant="outline"
              className="pl-3 pr-2 py-1 gap-1 hover:bg-accent transition-colors"
            >
              <span className="text-xs">{badge.label}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => clearIndividualFilter(badge.key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Ticket Number Search */}
      <div className="space-y-2">
        <Label htmlFor="ticket-search" className="text-sm font-medium">
          Ticket Number
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="ticket-search"
            placeholder="Search by ticket number..."
            value={filters.ticketNumber || ''}
            onChange={(e) => updateFilter('ticketNumber', e.target.value || undefined)}
            className="pl-9 pr-9 transition-shadow focus:shadow-md"
          />
          {filters.ticketNumber && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
              onClick={() => updateFilter('ticketNumber', undefined)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Date Range Section */}
      <Collapsible 
        open={openSections.dateRange} 
        onOpenChange={(open) => setOpenSections(prev => ({ ...prev, dateRange: open }))}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 -mx-3 rounded-md hover:bg-accent/50 transition-colors group">
          <div className="flex items-center gap-2 font-medium text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            Date Range
            {(filters.startDate || filters.endDate) && (
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            )}
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform duration-200",
            openSections.dateRange && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-3 pl-6 border-l-2 border-primary/20">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Quick Select</p>
            <div className="flex flex-wrap gap-2">
              {datePresets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => applyDatePreset(preset.value)}
                    className="hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {preset.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-xs">From Date</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
                className="transition-shadow focus:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-xs">To Date</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
                className="transition-shadow focus:shadow-md"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Status Filter */}
      <Collapsible 
        open={openSections.status} 
        onOpenChange={(open) => setOpenSections(prev => ({ ...prev, status: open }))}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 -mx-3 rounded-md hover:bg-accent/50 transition-colors group">
          <div className="flex items-center gap-2 font-medium text-sm">
            Status
            {filters.status.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.status.length}
              </Badge>
            )}
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform duration-200",
            openSections.status && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-3 pl-6 border-l-2 border-primary/20">
          <div className="grid grid-cols-1 gap-2">
            {statusOptions.map((status) => (
              <div 
                key={status.value} 
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-md transition-colors hover:bg-accent/50 cursor-pointer",
                  filters.status.includes(status.value) && "bg-primary/5 border border-primary/20"
                )}
                onClick={() => handleStatusToggle(status.value)}
              >
                <Checkbox
                  id={`status-${status.value}`}
                  checked={filters.status.includes(status.value)}
                  onCheckedChange={() => handleStatusToggle(status.value)}
                  className="pointer-events-none"
                />
                <Label
                  htmlFor={`status-${status.value}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Day Type Filter */}
      <Collapsible 
        open={openSections.dayType} 
        onOpenChange={(open) => setOpenSections(prev => ({ ...prev, dayType: open }))}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 -mx-3 rounded-md hover:bg-accent/50 transition-colors group">
          <div className="flex items-center gap-2 font-medium text-sm">
            Day Type
            {filters.dayType.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.dayType.length}
              </Badge>
            )}
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform duration-200",
            openSections.dayType && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-3 pl-6 border-l-2 border-primary/20">
          <div className="grid grid-cols-2 gap-2">
            {dayTypeOptions.map((dayType) => (
              <div 
                key={dayType.value} 
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-md transition-colors hover:bg-accent/50 cursor-pointer",
                  filters.dayType.includes(dayType.value) && "bg-primary/5 border border-primary/20"
                )}
                onClick={() => handleDayTypeToggle(dayType.value)}
              >
                <Checkbox
                  id={`day-${dayType.value}`}
                  checked={filters.dayType.includes(dayType.value)}
                  onCheckedChange={() => handleDayTypeToggle(dayType.value)}
                  className="pointer-events-none"
                />
                <Label
                  htmlFor={`day-${dayType.value}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {dayType.label}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Hours Range */}
      <Collapsible 
        open={openSections.hours} 
        onOpenChange={(open) => setOpenSections(prev => ({ ...prev, hours: open }))}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 -mx-3 rounded-md hover:bg-accent/50 transition-colors group">
          <div className="flex items-center gap-2 font-medium text-sm">
            <Clock className="h-4 w-4 text-primary" />
            Hours Range
            {(filters.minHours !== undefined || filters.maxHours !== undefined) && (
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            )}
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform duration-200",
            openSections.hours && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3 pl-6 border-l-2 border-primary/20">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="min-hours" className="text-xs">Min Hours</Label>
              <div className="relative">
                <Input
                  id="min-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={filters.minHours ?? ''}
                  onChange={(e) => updateFilter('minHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="pr-12 transition-shadow focus:shadow-md"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  hrs
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-hours" className="text-xs">Max Hours</Label>
              <div className="relative">
                <Input
                  id="max-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="24"
                  value={filters.maxHours ?? ''}
                  onChange={(e) => updateFilter('maxHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="pr-12 transition-shadow focus:shadow-md"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  hrs
                </span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Amount Range */}
      <Collapsible 
        open={openSections.amount} 
        onOpenChange={(open) => setOpenSections(prev => ({ ...prev, amount: open }))}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 -mx-3 rounded-md hover:bg-accent/50 transition-colors group">
          <div className="flex items-center gap-2 font-medium text-sm">
            <DollarSign className="h-4 w-4 text-primary" />
            Amount Range
            {(filters.minAmount !== undefined || filters.maxAmount !== undefined) && (
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            )}
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform duration-200",
            openSections.amount && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3 pl-6 border-l-2 border-primary/20">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="min-amount" className="text-xs">Min Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  RM
                </span>
                <Input
                  id="min-amount"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="0"
                  value={filters.minAmount ?? ''}
                  onChange={(e) => updateFilter('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="pl-10 transition-shadow focus:shadow-md"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-amount" className="text-xs">Max Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  RM
                </span>
                <Input
                  id="max-amount"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="10000"
                  value={filters.maxAmount ?? ''}
                  onChange={(e) => updateFilter('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="pl-10 transition-shadow focus:shadow-md"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
