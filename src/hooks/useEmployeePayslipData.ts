import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EmployeePayslipData {
  employee: {
    employee_id: string;
    employee_no: string;
    full_name: string;
    ic_no: string | null;
    epf_no: string | null;
    socso_no: string | null;
    income_tax_no: string | null;
    department: string;
    position: string;
  };
  otSummary: {
    period: string;
    totalAmount: number;
    totalHours: number;
    requestCount: number;
  };
}

export function useEmployeePayslipData(employeeId: string, month: Date) {
  return useQuery({
    queryKey: ['employee-payslip', employeeId, month.getMonth(), month.getFullYear()],
    queryFn: async (): Promise<EmployeePayslipData> => {
      const year = month.getFullYear();
      const monthNum = month.getMonth() + 1;
      
      // Calculate date range
      const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      // Fetch employee profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          employee_id,
          full_name,
          ic_no,
          epf_no,
          socso_no,
          income_tax_no,
          department_id,
          position_id,
          departments!profiles_department_id_fkey(name),
          positions!profiles_position_id_fkey(title)
        `)
        .eq('id', employeeId)
        .single();

      if (profileError) throw profileError;

      // Fetch OT requests for the month
      const { data: otRequests, error: otError } = await supabase
        .from('ot_requests')
        .select('ot_date, total_hours, ot_amount, status')
        .eq('employee_id', employeeId)
        .gte('ot_date', startDate)
        .lte('ot_date', endDate)
        .in('status', ['hr_certified', 'bod_approved']);

      if (otError) throw otError;

      const totalAmount = otRequests?.reduce((sum, r) => sum + (r.ot_amount || 0), 0) || 0;
      const totalHours = otRequests?.reduce((sum, r) => sum + (r.total_hours || 0), 0) || 0;

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];

      return {
        employee: {
          employee_id: profile.id,
          employee_no: profile.employee_id,
          full_name: profile.full_name,
          ic_no: profile.ic_no,
          epf_no: profile.epf_no,
          socso_no: profile.socso_no,
          income_tax_no: profile.income_tax_no,
          department: profile.departments?.name || 'Not Assigned',
          position: profile.positions?.title || 'Not Assigned',
        },
        otSummary: {
          period: `${monthNames[monthNum - 1]} ${year}`,
          totalAmount,
          totalHours,
          requestCount: otRequests?.length || 0,
        },
      };
    },
    enabled: !!employeeId,
  });
}
