import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PayslipData {
  company: {
    name: string;
    registration_no: string;
    address: string;
    phone: string;
    logo_url: string | null;
  };
  employee: {
    employee_no: string;
    full_name: string;
    ic_no: string | null;
    department: string;
    position: string;
  };
  period: {
    display: string;
    month: number;
    year: number;
  };
  overtime: {
    amount: number;
    hours: number;
  };
}

export function usePayslipData(employeeId: string, month: Date) {
  return useQuery({
    queryKey: ['payslip-data', employeeId, month.getMonth(), month.getFullYear()],
    queryFn: async (): Promise<PayslipData> => {
      const year = month.getFullYear();
      const monthNum = month.getMonth() + 1;
      
      // Calculate date range
      const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      // 1. Fetch company profile
      const { data: company, error: companyError } = await supabase
        .from('company_profile')
        .select('*')
        .single();

      if (companyError) throw companyError;

      // 2. Fetch employee profile with relationships
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          employee_id,
          full_name,
          ic_no,
          department_id,
          position_id,
          departments!profiles_department_id_fkey(name),
          positions!profiles_position_id_fkey(title)
        `)
        .eq('id', employeeId)
        .single();

      if (profileError) throw profileError;

      // 3. Fetch approved OT requests for the period
      const { data: otRequests, error: otError } = await supabase
        .from('ot_requests')
        .select('total_hours, ot_amount')
        .eq('employee_id', employeeId)
        .gte('ot_date', startDate)
        .lte('ot_date', endDate)
        .in('status', ['hr_certified', 'bod_approved']);

      if (otError) throw otError;

      // 4. Aggregate OT data
      const totalAmount = otRequests?.reduce((sum, r) => sum + (r.ot_amount || 0), 0) || 0;
      const totalHours = otRequests?.reduce((sum, r) => sum + (r.total_hours || 0), 0) || 0;

      // 5. Format period display
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];

      // 6. Return formatted data
      return {
        company: {
          name: company.name,
          registration_no: company.registration_no,
          address: company.address,
          phone: company.phone,
          logo_url: company.logo_url,
        },
        employee: {
          employee_no: profile.employee_id,
          full_name: profile.full_name,
          ic_no: profile.ic_no,
          department: profile.departments?.name || 'Not Assigned',
          position: profile.positions?.title || 'Not Assigned',
        },
        period: {
          display: `${monthNames[monthNum - 1]} ${year}`,
          month: monthNum,
          year,
        },
        overtime: {
          amount: totalAmount,
          hours: totalHours,
        },
      };
    },
    enabled: !!employeeId,
  });
}
