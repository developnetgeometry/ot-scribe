import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth } from 'date-fns';
import { OTStatus } from '@/types/otms';

export interface CalendarFilters {
  employeeId?: string;
  supervisorId?: string;
  departmentId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  viewType?: 'all' | 'employee' | 'supervisor' | 'bod';
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: OTStatus | 'holiday';
  type: 'ot_request' | 'holiday';
  employee?: {
    id: string;
    name: string;
    employee_id: string;
    department: string;
  };
  supervisor?: {
    id: string;
    name: string;
  };
  hours?: number;
  amount?: number;
  reason?: string;
  remarks?: string;
  day_type?: string;
}

export function useCalendarData(filters: CalendarFilters) {
  return useQuery({
    queryKey: ['calendar-data', filters],
    queryFn: async () => {
      const startDate = filters.startDate || startOfMonth(new Date());
      const endDate = filters.endDate || endOfMonth(new Date());

      // Fetch OT requests
      let otQuery = supabase
        .from('ot_requests')
        .select(`
          *,
          employee:profiles!ot_requests_employee_id_fkey(id, full_name, employee_id, department:departments(name)),
          supervisor:profiles!ot_requests_supervisor_id_fkey(id, full_name)
        `)
        .gte('ot_date', startDate.toISOString().split('T')[0])
        .lte('ot_date', endDate.toISOString().split('T')[0]);

      // Apply filters
      if (filters.employeeId) {
        otQuery = otQuery.eq('employee_id', filters.employeeId);
      }
      if (filters.supervisorId) {
        otQuery = otQuery.eq('supervisor_id', filters.supervisorId);
      }
      if (filters.status && filters.status !== 'all') {
        otQuery = otQuery.eq('status', filters.status as OTStatus);
      }

      const { data: otRequests, error: otError } = await otQuery;
      if (otError) throw otError;

      // Fetch public holidays
      const { data: holidays, error: holidaysError } = await supabase
        .from('public_holidays')
        .select('*')
        .gte('holiday_date', startDate.toISOString().split('T')[0])
        .lte('holiday_date', endDate.toISOString().split('T')[0]);

      if (holidaysError) throw holidaysError;

      // Transform OT requests to calendar events
      const otEvents: CalendarEvent[] = (otRequests || []).map((req: any) => {
        const otDate = new Date(req.ot_date + 'T00:00:00');
        const [startHour, startMin] = req.start_time.split(':').map(Number);
        const [endHour, endMin] = req.end_time.split(':').map(Number);

        const startDateTime = new Date(otDate);
        startDateTime.setHours(startHour, startMin);

        const endDateTime = new Date(otDate);
        endDateTime.setHours(endHour, endMin);

        return {
          id: req.id,
          title: `${req.employee?.full_name || 'Unknown'} - ${req.total_hours}h OT`,
          start: startDateTime,
          end: endDateTime,
          status: req.status,
          type: 'ot_request' as const,
          employee: req.employee ? {
            id: req.employee.id,
            name: req.employee.full_name,
            employee_id: req.employee.employee_id,
            department: req.employee.department?.name || 'N/A',
          } : undefined,
          supervisor: req.supervisor ? {
            id: req.supervisor.id,
            name: req.supervisor.full_name,
          } : undefined,
          hours: req.total_hours,
          amount: req.ot_amount,
          reason: req.reason,
          remarks: req.hr_remarks || req.supervisor_remarks,
          day_type: req.day_type,
        };
      });

      // Transform holidays to calendar events
      const holidayEvents: CalendarEvent[] = (holidays || []).map((holiday: any) => {
        const holidayDate = new Date(holiday.holiday_date + 'T00:00:00');
        return {
          id: holiday.id,
          title: holiday.holiday_name,
          start: holidayDate,
          end: holidayDate,
          status: 'holiday',
          type: 'holiday' as const,
        };
      });

      return [...otEvents, ...holidayEvents];
    },
  });
}
