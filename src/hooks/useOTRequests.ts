import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OTRequest } from '@/types/otms';

interface UseOTRequestsOptions {
  status?: string | string[];
  startDate?: string;
  endDate?: string;
  ticketNumber?: string;
  dayType?: string[];
  minHours?: number;
  maxHours?: number;
  minAmount?: number;
  maxAmount?: number;
}

export function useOTRequests(options: UseOTRequestsOptions = {}) {
  return useQuery({
    queryKey: ['ot-requests', options],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('ot_requests')
        .select(`
          *,
          profiles!ot_requests_employee_id_fkey(
            employee_id,
            full_name
          )
        `)
        .eq('employee_id', user.id)
        .order('ot_date', { ascending: false });

      if (options.status) {
        if (Array.isArray(options.status) && options.status.length > 0) {
          query = query.in('status', options.status as any);
        } else if (typeof options.status === 'string' && options.status !== 'all') {
          query = query.eq('status', options.status as any);
        }
      }

      if (options.startDate) {
        query = query.gte('ot_date', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('ot_date', options.endDate);
      }

      if (options.ticketNumber) {
        query = query.ilike('ticket_number', `%${options.ticketNumber}%`);
      }

      if (options.dayType && options.dayType.length > 0) {
        query = query.in('day_type', options.dayType as any);
      }

      if (options.minHours !== undefined) {
        query = query.gte('total_hours', options.minHours);
      }

      if (options.maxHours !== undefined) {
        query = query.lte('total_hours', options.maxHours);
      }

      if (options.minAmount !== undefined) {
        query = query.gte('ot_amount', options.minAmount);
      }

      if (options.maxAmount !== undefined) {
        query = query.lte('ot_amount', options.maxAmount);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as OTRequest[];
    },
  });
}

export function useOTRequestDetails(requestId: string | null) {
  return useQuery({
    queryKey: ['ot-request', requestId],
    queryFn: async () => {
      if (!requestId) return null;

      const { data, error } = await supabase
        .from('ot_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;
      return data as OTRequest;
    },
    enabled: !!requestId,
  });
}
