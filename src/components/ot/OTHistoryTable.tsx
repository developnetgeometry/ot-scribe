import { format } from 'date-fns';
import { Eye, RotateCcw, ChevronDown } from 'lucide-react';
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
}

interface OTHistoryTableProps {
  requests: OTRequest[];
  onViewDetails: (request: OTRequest) => void;
  onResubmit?: (request: OTRequest) => void;
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

export function OTHistoryTable({ requests, onViewDetails, onResubmit }: OTHistoryTableProps) {
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
            <TableHead>Date</TableHead>
            <TableHead>Day Type</TableHead>
            <TableHead>Time Sessions</TableHead>
            <TableHead className="text-right">Total Hours</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Info</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedRequests.map((grouped) => (
            <TableRow key={grouped.date}>
              <TableCell className="font-medium">
                {format(new Date(grouped.date), 'dd MMM yyyy')}
              </TableCell>
              <TableCell>
                <Badge className={getDayTypeColor(grouped.dayType)}>
                  {getDayTypeLabel(grouped.dayType)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {grouped.sessions.map((session, idx) => (
                    <span key={session.id}>
                      {formatTimeRange(session.startTime, session.endTime)}
                      {idx < grouped.sessions.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatHours(grouped.totalHours)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {grouped.statuses.length === 1 ? (
                    <StatusBadge status={grouped.statuses[0]} />
                  ) : (
                    grouped.statuses.map((status) => (
                      <StatusBadge key={status} status={status} />
                    ))
                  )}
                </div>
              </TableCell>
              <TableCell>
                {grouped.resubmissionInfo && (
                  <ResubmissionBadge 
                    resubmissionCount={grouped.resubmissionInfo.count} 
                    isResubmission={grouped.resubmissionInfo.isResubmission} 
                  />
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {grouped.sessions.length === 1 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(grouped.sessions[0].request)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {grouped.sessions.map((session) => (
                          <DropdownMenuItem
                            key={session.id}
                            onClick={() => onViewDetails(session.request)}
                          >
                            {formatTimeRange(session.startTime, session.endTime)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
