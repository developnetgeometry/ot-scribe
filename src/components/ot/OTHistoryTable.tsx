import { format } from 'date-fns';
import { Eye, RotateCcw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { ResubmissionBadge } from './ResubmissionBadge';
import { OTRequest } from '@/types/otms';
import { formatCurrency, formatHours, getDayTypeColor, getDayTypeLabel } from '@/lib/otCalculations';

interface OTHistoryTableProps {
  requests: OTRequest[];
  onViewDetails: (request: OTRequest) => void;
  onResubmit?: (request: OTRequest) => void;
}

export function OTHistoryTable({ requests, onViewDetails, onResubmit }: OTHistoryTableProps) {
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
            <TableHead className="text-right">Hours</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Info</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{format(new Date(request.ot_date), 'dd MMM yyyy')}</TableCell>
              <TableCell>
                <Badge className={getDayTypeColor(request.day_type)}>
                  {getDayTypeLabel(request.day_type)}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatHours(request.total_hours)}
              </TableCell>
              <TableCell>
                <StatusBadge status={request.status} />
              </TableCell>
              <TableCell>
                <ResubmissionBadge 
                  resubmissionCount={request.resubmission_count} 
                  isResubmission={request.is_resubmission} 
                />
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(request)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {request.status === 'rejected' && onResubmit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResubmit(request)}
                      className="gap-1"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Resubmit
                    </Button>
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
