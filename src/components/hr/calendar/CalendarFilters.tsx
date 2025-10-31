import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { CalendarFilters as Filters } from '@/hooks/hr/useCalendarData';
import { useEmployees } from '@/hooks/hr/useEmployees';
import { cn } from '@/lib/utils';

interface CalendarFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function CalendarFilters({ filters, onFiltersChange }: CalendarFiltersProps) {
  const { data: employees } = useEmployees();
  const [startDate, setStartDate] = useState<Date | undefined>(filters.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(filters.endDate);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onFiltersChange({
      viewType: 'all',
    });
  };

  const supervisors = employees?.filter((emp: any) => 
    emp.user_roles?.some((r: any) => r.role === 'supervisor')
  ) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>View Type</Label>
          <Select
            value={filters.viewType || 'all'}
            onValueChange={(value) => handleFilterChange('viewType', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="employee">By Employee</SelectItem>
              <SelectItem value="supervisor">By Supervisor</SelectItem>
              <SelectItem value="bod">BOD Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filters.viewType === 'employee' && (
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select
              value={filters.employeeId || ''}
              onValueChange={(value) => handleFilterChange('employeeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((emp: any) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.employee_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filters.viewType === 'supervisor' && (
          <div className="space-y-2">
            <Label>Supervisor</Label>
            <Select
              value={filters.supervisorId || ''}
              onValueChange={(value) => handleFilterChange('supervisorId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map((sup: any) => (
                  <SelectItem key={sup.id} value={sup.id}>
                    {sup.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending_verification">Pending Verification</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  handleFilterChange('startDate', date);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  handleFilterChange('endDate', date);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
