import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePendingRecertifications, useRecertifyOTActions } from '@/hooks/hr/useRecertifyOT';
import { OTRequest } from '@/types/otms';
import { formatCurrency, formatHours, getDayTypeColor, getDayTypeLabel } from '@/lib/otCalculations';

export default function RecertifyOT() {
  const navigate = useNavigate();
  const { data: requests = [], isLoading } = usePendingRecertifications();
  const { recertify, decline } = useRecertifyOTActions();
  
  const [selectedRequest, setSelectedRequest] = useState<OTRequest | null>(null);
  const [action, setAction] = useState<'recertify' | 'decline' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAction = (request: OTRequest, actionType: 'recertify' | 'decline') => {
    setSelectedRequest(request);
    setAction(actionType);
    setRemarks('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedRequest || !action || !remarks.trim()) return;

    if (action === 'recertify') {
      await recertify.mutateAsync({ requestId: selectedRequest.id, remarks });
    } else {
      await decline.mutateAsync({ requestId: selectedRequest.id, remarks });
    }

    setDialogOpen(false);
    setSelectedRequest(null);
    setAction(null);
    setRemarks('');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/hr/approve')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">OT Recertification</h1>
              <p className="text-muted-foreground">Review BOD-rejected requests for recertification</p>
            </div>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            These requests were previously certified by HR but rejected by BOD. You can choose to:
            <br />
            <strong>Recertify</strong> - Send back to BOD for another review
            <br />
            <strong>Decline</strong> - Send back to employee for corrections
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Pending Recertification ({requests.length})</CardTitle>
            <CardDescription>Requests awaiting your decision</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No requests pending recertification</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Day Type</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>BOD Remarks</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{(request as any).profiles?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(request as any).profiles?.department?.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(request.ot_date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>
                          <Badge className={getDayTypeColor(request.day_type)}>
                            {getDayTypeLabel(request.day_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatHours(request.total_hours)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(request.ot_amount || 0)}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {request.bod_remarks || 'No remarks'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(request, 'recertify')}
                              className="gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Recertify
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(request, 'decline')}
                              className="gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Decline
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {action === 'recertify' ? 'Recertify OT Request' : 'Decline Recertification'}
              </DialogTitle>
              <DialogDescription>
                {action === 'recertify'
                  ? 'Confirm that this request meets all requirements and should be sent back to BOD.'
                  : 'Provide clear feedback for the employee to make necessary corrections.'}
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <strong>BOD Rejection Reason:</strong>
                    <p className="mt-2">{selectedRequest.bod_remarks || 'No remarks provided'}</p>
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="remarks">Your Remarks *</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={
                      action === 'recertify'
                        ? 'Explain why this should be recertified...'
                        : 'Explain what corrections are needed...'
                    }
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!remarks.trim() || recertify.isPending || decline.isPending}
              >
                {action === 'recertify' ? 'Recertify & Send to BOD' : 'Decline & Send to Employee'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
