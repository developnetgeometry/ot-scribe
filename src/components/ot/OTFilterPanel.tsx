import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OTFilters } from '@/hooks/useOTFilters';
import { ChevronDown, Search, X, Calendar } from 'lucide-react';
import { useState } from 'react';

interface OTFilterPanelProps {
  filters: OTFilters;
  updateFilter: <K extends keyof OTFilters>(key: K, value: OTFilters[K]) => void;
  clearFilters: () => void;
  applyDatePreset: (preset: string) => void;
  activeFilterCount: number;
}

const datePresets = [
  { value: 'today', label: 'Today', icon: Calendar },
  { value: 'last7days', label: 'Last 7 Days', icon: Calendar },
  { value: 'last30days', label: 'Last 30 Days', icon: Calendar },
  { value: 'thisMonth', label: 'This Month', icon: Calendar },
  { value: 'lastMonth', label: 'Last Month', icon: Calendar },
  { value: 'thisYear', label: 'This Year', icon: Calendar },
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
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearIndividualFilter = (filterKey: string) => {
    switch (filterKey) {
      case 'ticketNumber':
        updateFilter('ticketNumber', undefined);
        break;
      case 'dateRange':
        updateFilter('startDate', undefined);
        updateFilter('endDate', undefined);
        break;
    }
  };

  const getActiveFilterBadges = () => {
    const badges = [];
    
    if (filters.ticketNumber) {
      badges.push({
        key: 'ticketNumber',
        label: `Ticket: ${filters.ticketNumber}`,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      });
    }
    
    if (filters.startDate || filters.endDate) {
      const dateLabel = filters.startDate && filters.endDate 
        ? `${filters.startDate} to ${filters.endDate}`
        : filters.startDate 
        ? `From ${filters.startDate}`
        : `Until ${filters.endDate}`;
      badges.push({
        key: 'dateRange',
        label: dateLabel,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      });
    }
    
    return badges;
  };

  const activeBadges = getActiveFilterBadges();

  return (
    <div className="space-y-4 p-6 border border-border rounded-lg bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
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
      {activeBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {activeBadges.map((badge, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`pl-3 pr-2 py-1 gap-1 hover:bg-accent transition-colors ${badge.color}`}
            >
              <span className="text-xs">{badge.label}</span>
              <button
                className="h-4 w-4 p-0 hover:bg-transparent inline-flex items-center justify-center"
                onClick={() => clearIndividualFilter(badge.key)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Info message */}
      <p className="text-sm text-muted-foreground text-center py-2">
        Search by ticket number or filter by date range
      </p>

      {/* Ticket Number Search */}
      <div className="space-y-2">
        <Label htmlFor="ticketNumber" className="text-base font-medium flex items-center gap-2">
          <Search className="h-5 w-5" />
          Ticket Number
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="ticketNumber"
            placeholder="Search by ticket number..."
            value={filters.ticketNumber || ''}
            onChange={(e) => updateFilter('ticketNumber', e.target.value || undefined)}
            className="pl-9 pr-9 h-11"
          />
          {filters.ticketNumber && (
            <button
              onClick={() => updateFilter('ticketNumber', undefined)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Date Range Filter */}
      <Collapsible
        open={openSections.dateRange}
        onOpenChange={() => toggleSection('dateRange')}
        className="border border-border rounded-lg overflow-hidden transition-all duration-200"
        style={{
          borderLeftWidth: openSections.dateRange ? '4px' : '1px',
          borderLeftColor: openSections.dateRange ? 'hsl(var(--primary))' : undefined,
        }}
      >
        <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors">
          <span className="font-medium flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range
            {(filters.startDate || filters.endDate) && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openSections.dateRange ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 pt-2 space-y-4 bg-secondary/10">
          {/* Quick Date Presets */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Quick Select</Label>
            <div className="grid grid-cols-3 gap-2">
              {datePresets.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="sm"
                  onClick={() => applyDatePreset(preset.value)}
                  className="justify-start gap-2 text-xs h-9"
                >
                  <preset.icon className="h-3 w-3" />
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="space-y-3 pt-2 border-t">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm">From Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm">To Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
                className="h-10"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
