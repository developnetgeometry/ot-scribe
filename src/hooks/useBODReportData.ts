import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface EmployeeOTSummary {
  employee_no: string;
  employee_name: string;
  department: string;
  position: string;
  total_ot_hours: number;
  amount: number;
  monthly_total: number;
  has_violations: boolean;
}

export function useBODReportData(selectedMonth?: Date) {
  const month = selectedMonth || new Date();
  const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(month), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['bod-report', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ot_requests')
        .select(`
          id,
          employee_id,
          ot_date,
          total_hours,
          ot_amount,
          status,
          threshold_violations,
          profiles!ot_requests_employee_id_fkey(
            employee_id,
            full_name,
            department_id,
            position_id,
            departments!profiles_department_id_fkey(name, code),
            positions!profiles_position_id_fkey(title)
          )
        `)
        .gte('ot_date', startDate)
        .lte('ot_date', endDate)
        .order('ot_date', { ascending: false });

      if (error) throw error;

      // Aggregate by employee
      const aggregated = aggregateByEmployee(data || []);
      
      // Calculate stats
      const stats = calculateStats(data || []);

      return {
        rawData: data || [],
        aggregated,
        stats
      };
    }
  });
}

function aggregateByEmployee(requests: any[]): EmployeeOTSummary[] {
  const grouped = new Map<string, EmployeeOTSummary>();
  
  requests.forEach(req => {
    const empId = req.employee_id;
    const profile = req.profiles;
    
    if (!grouped.has(empId)) {
      grouped.set(empId, {
        employee_no: profile?.employee_id || empId,
        employee_name: profile?.full_name || 'Unknown',
        department: profile?.departments?.name || 'N/A',
        position: profile?.positions?.title || 'N/A',
        total_ot_hours: 0,
        amount: 0,
        monthly_total: 0,
        has_violations: false,
      });
    }
    
    const emp = grouped.get(empId)!;
    emp.total_ot_hours += req.total_hours || 0;
    emp.amount += req.ot_amount || 0;
    emp.monthly_total = emp.amount;
    
    if (req.threshold_violations && Object.keys(req.threshold_violations).length > 0) {
      emp.has_violations = true;
    }
  });
  
  return Array.from(grouped.values());
}

function calculateStats(requests: any[]) {
  return {
    pendingReview: requests.filter(r => r.status === 'approved').length,
    totalHours: requests.reduce((sum, r) => sum + (r.total_hours || 0), 0),
    totalCost: requests.reduce((sum, r) => sum + (r.ot_amount || 0), 0),
    withViolations: requests.filter(r => 
      r.threshold_violations && Object.keys(r.threshold_violations).length > 0
    ).length,
  };
}
