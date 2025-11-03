import { format } from 'date-fns';
import { RotateCcw, ChevronDown, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { ResubmissionBadge } from './ResubmissionBadge';
import { OTRequest, OTStatus, DayType } from '@/types/otms';
import { formatCurrency, formatHours, getDayTypeColor, getDayTypeLabel, formatTimeRange } from '@/lib/otCalculations';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  onResubmit?: (request: OTRequest) => void;
  onEdit?: (request: OTRequest) => void;
}

function groupRequestsByDate(requests: OTRequest[]): GroupedOTRequest[] {
  const grouped = requests.reduce((acc, request) => {
    const date = request.ot_date;
    
    if (!acc[date]) {
      acc[date] = {
        date,
        dayType: request.day_type,
        sessions: [],
        totalHours: 0,
        statuses: new Set<OTStatus>(),
        hasRejected: false,
        resubmissionInfo: undefined,
        profiles: request.profiles,
      };
    }
    
    acc[date].sessions.push({
      id: request.id,
      startTime: request.start_time,
      endTime: request.end_time,
      hours: request.total_hours,
      status: request.status,
      request,
    });
    
    acc[date].totalHours += request.total_hours;
    acc[date].statuses.add(request.status);
    
    if (request.status === 'rejected') {
      acc[date].hasRejected = true;
    }
    
    if (request.is_resubmission || request.resubmission_count > 0) {
      acc[date].resubmissionInfo = {
        count: request.resubmission_count,
        isResubmission: request.is_resubmission,
      };
    }
    
    return acc;
  }, {} as Record<string, any>);
  
  return Object.values(grouped).map(g => ({
    ...g,
    statuses: Array.from(g.statuses),
    sessions: g.sessions.sort((a: OTSession, b: OTSession) => 
      a.startTime.localeCompare(b.startTime)
    ),
  }));
}

export function OTHistoryTable({ requests, onViewDetails, onResubmit, onEdit }: OTHistoryTableProps) {
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
            <TableHead className="text-right">Total Hours</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                    <div key={session.id} className="text-sm">
                      <span className="text-foreground">
                        {formatTimeRange(session.startTime, session.endTime)}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        ({formatHours(session.hours)} hrs)
                      </span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-lg font-semibold text-primary">
                  {formatHours(grouped.totalHours)} hours
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {grouped.sessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-2">
                      <button
                        onClick={() => onViewDetails(session.request)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <StatusBadge status={session.status} />
                      </button>
                      {session.request.is_resubmission && (
                        <ResubmissionBadge 
                          resubmissionCount={session.request.resubmission_count} 
                          isResubmission={session.request.is_resubmission} 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {grouped.sessions.some(s => s.status === 'pending_verification') && onEdit && (
                    grouped.sessions.filter(s => s.status === 'pending_verification').length === 1 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(grouped.sessions.find(s => s.status === 'pending_verification')!.request)}
                        className="gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Edit className="h-4 w-4" />
                            Edit
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {grouped.sessions
                            .filter(s => s.status === 'pending_verification')
                            .map((session) => (
                              <DropdownMenuItem
                                key={session.id}
                                onClick={() => onEdit(session.request)}
                              >
                                {formatTimeRange(session.startTime, session.endTime)}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  )}
                  {grouped.hasRejected && onResubmit && (
                    grouped.sessions.filter(s => s.status === 'rejected').length === 1 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResubmit(grouped.sessions.find(s => s.status === 'rejected')!.request)}
                        className="gap-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Resubmit
                      </Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1">
                            <RotateCcw className="h-4 w-4" />
                            Resubmit
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {grouped.sessions
                            .filter(s => s.status === 'rejected')
                            .map((session) => (
                              <DropdownMenuItem
                                key={session.id}
                                onClick={() => onResubmit(session.request)}
                              >
                                {formatTimeRange(session.startTime, session.endTime)}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
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
