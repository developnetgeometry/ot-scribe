import { useState, useCallback } from 'react';
import { startOfMonth, endOfMonth, subDays, startOfYear, subMonths } from 'date-fns';
import { DayType } from '@/types/otms';

export interface OTFilters {
  status: string[];
  startDate?: string;
  endDate?: string;
  ticketNumber?: string;
  dayType: DayType[];
  minHours?: number;
  maxHours?: number;
  minAmount?: number;
  maxAmount?: number;
}

const defaultFilters: OTFilters = {
  status: [],
  dayType: [],
};

export function useOTFilters() {
  const [filters, setFilters] = useState<OTFilters>(defaultFilters);

  const updateFilter = useCallback(<K extends keyof OTFilters>(
    key: K,
    value: OTFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const applyDatePreset = useCallback((preset: string) => {
    const today = new Date();
    let start: Date | undefined;
    let end: Date | undefined = today;

    switch (preset) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'last7days':
        start = subDays(today, 6);
        break;
      case 'last30days':
        start = subDays(today, 29);
        break;
      case 'thisMonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'lastMonth':
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        break;
      case 'thisYear':
        start = startOfYear(today);
        break;
    }

    setFilters(prev => ({
      ...prev,
      startDate: start?.toISOString().split('T')[0],
      endDate: end?.toISOString().split('T')[0],
    }));
  }, []);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.ticketNumber) count++;
    if (filters.dayType.length > 0) count++;
    if (filters.minHours !== undefined || filters.maxHours !== undefined) count++;
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    applyDatePreset,
    activeFilterCount: getActiveFilterCount(),
  };
}
