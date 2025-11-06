import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GroupedOTRequest } from '@/types/otms';
import { formatTime12Hour, formatHours } from '@/lib/otCalculations';

interface MixedActionModalProps {
  request: GroupedOTRequest | null;
  approveSessionIds: string[];
  rejectSessionIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (approveRemarks: string, rejectRemarks: string) => Promise<void>;
  isLoading: boolean;
}

export function MixedActionModal({ 
  request, 
  approveSessionIds,
  rejectSessionIds,
  open, 
  onOpenChange, 
  onConfirm, 
  isLoading
}: MixedActionModalProps) {
  const [approveRemarks, setApproveRemarks] = useState('');
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!rejectRemarks.trim()) {
      setError('Reason for rejection is required');
      return;
    }
    if (rejectRemarks.trim().length < 10) {
      setError('Please provide a detailed reason for rejection (at least 10 characters)');
      return;
    }
    
    onConfirm(approveRemarks, rejectRemarks);
    setApproveRemarks('');
    setRejectRemarks('');
    setError('');
  };

  const handleCancel = () => {
    setApproveRemarks('');
    setRejectRemarks('');
    setError('');
    onOpenChange(false);
  };

  if (!request) return null;

  const profile = (request as any).profiles;
  const approveSessions = request.sessions.filter(s => approveSessionIds.includes(s.id));
  const rejectSessions = request.sessions.filter(s => rejectSessionIds.includes(s.id));

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-foreground">
            Mixed Action: Approve & Reject Sessions
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            You are approving {approveSessions.length} session(s) and rejecting {rejectSessions.length} session(s).
            Please provide remarks for each action.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Employee:</span>
                <p className="font-semibold text-foreground">{profile?.full_name || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Employee ID:</span>
                <p className="font-semibold text-foreground">{profile?.employee_id || request.employee_id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-semibold text-foreground">{format(new Date(request.ot_date), 'dd MMM yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Sessions to Approve */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Label className="text-foreground font-semibold">
                Sessions to Approve ({approveSessions.length})
              </Label>
            </div>
            <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded-md space-y-1">
              {approveSessions.map((session, idx) => (
                <div key={idx} className="text-sm text-foreground">
                  • {formatTime12Hour(session.start_time)} - {formatTime12Hour(session.end_time)} 
                  <span className="text-muted-foreground ml-2">({formatHours(session.total_hours)} hrs)</span>
                </div>
              ))}
              <div className="text-sm font-semibold pt-1 border-t border-green-200 dark:border-green-800">
                Total: {formatHours(approveSessions.reduce((sum, s) => sum + s.total_hours, 0))} hours
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approve-remarks" className="text-foreground">
                Remarks for Approved Sessions (Optional)
              </Label>
              <Textarea
                id="approve-remarks"
                placeholder="Add any additional comments for the approved sessions (optional)..."
                value={approveRemarks}
                onChange={(e) => setApproveRemarks(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          {/* Sessions to Reject */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <Label className="text-foreground font-semibold">
                Sessions to Reject ({rejectSessions.length})
              </Label>
            </div>
            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 rounded-md space-y-1">
              {rejectSessions.map((session, idx) => (
                <div key={idx} className="text-sm text-foreground">
                  • {formatTime12Hour(session.start_time)} - {formatTime12Hour(session.end_time)} 
                  <span className="text-muted-foreground ml-2">({formatHours(session.total_hours)} hrs)</span>
                </div>
              ))}
              <div className="text-sm font-semibold pt-1 border-t border-red-200 dark:border-red-800">
                Total: {formatHours(rejectSessions.reduce((sum, s) => sum + s.total_hours, 0))} hours
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reject-remarks" className="text-foreground font-semibold">
                Reason for Rejection <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reject-remarks"
                placeholder="Please provide a detailed reason for rejecting these sessions (minimum 10 characters)..."
                value={rejectRemarks}
                onChange={(e) => {
                  setRejectRemarks(e.target.value);
                  setError('');
                }}
                rows={3}
                className="resize-none"
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {rejectRemarks.length}/10 characters minimum
              </p>
            </div>
          </div>

          {/* Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. Make sure you have selected the correct sessions for approval and rejection.
            </AlertDescription>
          </Alert>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !rejectRemarks.trim() || rejectRemarks.trim().length < 10}
          >
            {isLoading ? 'Processing...' : 'Confirm Mixed Action'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
