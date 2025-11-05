import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { ResubmissionBadge } from './ResubmissionBadge';
import { OTRequest, OTStatus, DayType } from '@/types/otms';
import { formatCurrency, formatHours, getDayTypeColor, getDayTypeLabel, formatTimeRange } from '@/lib/otCalculations';

interface OTSession {
  id: string;
  startTime: string;
  endTime: string;
  hours: number;
  status: OTStatus;
  request: OTRequest;
}

interface GroupedOTRequest {
  date: string;
  dayType: DayType;
  sessions: OTSession[];
  totalHours: number;
  statuses: OTStatus[];
  hasRejected: boolean;
  resubmissionInfo?: {
    count: number;
    isResubmission: boolean;
  };
  profiles?: {
    employee_id: string;
    full_name: string;
  };
}

interface OTHistoryTableProps {
  requests: OTRequest[];
  onViewDetails: (request: OTRequest) => void;
}

function groupRequestsByDate(requests: OTRequest[]): GroupedOTRequest[] {
  const grouped = requests.reduce((acc, request) => {
    const date = request.ot_date;
    
    if (!acc[date]) {
      acc[date] = {
        date,
        dayType: request.day_type,
        sessions: new Map(), // Use Map for deduplication by time slot
        totalHours: 0,
        statuses: new Set<OTStatus>(),
        hasRejected: false,
        resubmissionInfo: undefined,
        profiles: request.profiles,
      };
    }

    // Create unique key for this time slot
    const timeSlotKey = `${request.start_time}_${request.end_time}`;
    
    // Check if we already have a session for this time slot
    const existingSession = acc[date].sessions.get(timeSlotKey);
    
    if (existingSession) {
      // Keep the most recent request (latest created_at or updated_at)
      const existingTimestamp = new Date(existingSession.request.updated_at || existingSession.request.created_at);
      const currentTimestamp = new Date(request.updated_at || request.created_at);
      
      if (currentTimestamp > existingTimestamp) {
        // Replace with newer request - adjust total hours
        acc[date].totalHours -= existingSession.hours;
        
        acc[date].sessions.set(timeSlotKey, {
          id: request.id,
          startTime: request.start_time,
          endTime: request.end_time,
          hours: request.total_hours,
          status: request.status,
          request,
        });
        
        acc[date].totalHours += request.total_hours;
      }
      // If existing is newer, skip this request
    } else {
      // First time seeing this time slot, add it
      acc[date].sessions.set(timeSlotKey, {
        id: request.id,
        startTime: request.start_time,
        endTime: request.end_time,
        hours: request.total_hours,
        status: request.status,
        request,
      });
      
      acc[date].totalHours += request.total_hours;
    }
    
    // Rebuild statuses from current sessions
    acc[date].statuses = new Set([...acc[date].sessions.values()].map((s: OTSession) => s.status));
    
    // Check for rejected status
    acc[date].hasRejected = [...acc[date].sessions.values()].some((s: OTSession) => s.status === 'rejected');
    
    // Track highest resubmission count
    if (request.is_resubmission || request.resubmission_count > 0) {
      if (!acc[date].resubmissionInfo || request.resubmission_count > acc[date].resubmissionInfo.count) {
        acc[date].resubmissionInfo = {
          count: request.resubmission_count,
          isResubmission: request.is_resubmission,
        };
      }
    }

    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).map(g => ({
    ...g,
    statuses: Array.from(g.statuses),
    sessions: Array.from(g.sessions.values()).sort((a: OTSession, b: OTSession) => 
      a.startTime.localeCompare(b.startTime)
    ),
  }));
}

export function OTHistoryTable({ requests, onViewDetails }: OTHistoryTableProps) {
  const groupedRequests = groupRequestsByDate(requests);
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No OT requests found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time Sessions</TableHead>
            <TableHead className="text-right">Hours</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedRequests.map((grouped) => (
            <TableRow key={grouped.date}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{grouped.profiles?.full_name || 'Unknown'}</span>
                  <span className="text-sm text-muted-foreground">{grouped.profiles?.employee_id || '-'}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {format(new Date(grouped.date), 'dd MMM yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {grouped.sessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-2">
                      <span className="text-sm text-foreground">
                        {formatTimeRange(session.startTime, session.endTime)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({formatHours(session.hours)} hrs)
                      </span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-semibold text-primary">
                  {formatHours(grouped.totalHours)} hours
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 flex-wrap">
                  {Array.from(new Set(grouped.sessions.map(s => s.status))).map((status, idx) => (
                    <button
                      key={idx}
                      onClick={() => onViewDetails(grouped.sessions.find(s => s.status === status)?.request!)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <StatusBadge status={status} />
                    </button>
                  ))}
                  {grouped.resubmissionInfo && (
                    <ResubmissionBadge 
                      resubmissionCount={grouped.resubmissionInfo.count} 
                      isResubmission={grouped.resubmissionInfo.isResubmission} 
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
