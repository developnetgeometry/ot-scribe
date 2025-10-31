import { useState } from 'react';
import { format } from 'date-fns';
import { XCircle, AlertTriangle } from 'lucide-react';
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

interface RejectOTModalProps {
  request: GroupedOTRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (remarks: string) => void;
  isLoading?: boolean;
}

export function RejectOTModal({ request, open, onOpenChange, onConfirm, isLoading }: RejectOTModalProps) {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!remarks.trim()) {
      setError('Reason for rejection is required');
      return;
    }
    if (remarks.trim().length < 10) {
      setError('Please provide a detailed reason (at least 10 characters)');
      return;
    }
    
    onConfirm(remarks);
    setRemarks('');
    setError('');
  };

  const handleCancel = () => {
    setRemarks('');
    setError('');
    onOpenChange(false);
  };

  if (!request) return null;

  const profile = (request as any).profiles;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Reject OT Submission
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-4 pt-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You are about to reject this overtime request. This action cannot be undone.
              </AlertDescription>
            </Alert>

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
                <div>
                  <span className="text-muted-foreground">Total Hours:</span>
                  <p className="font-semibold text-foreground">{formatHours(request.total_hours)} hours</p>
                </div>
              </div>

              {/* Sessions */}
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground text-sm">OT Sessions:</span>
                <div className="space-y-1 mt-1">
                  {request.sessions.map((session, idx) => (
                    <div key={idx} className="text-sm text-foreground">
                      • {formatTime12Hour(session.start_time)} - {formatTime12Hour(session.end_time)} 
                      <span className="text-muted-foreground ml-2">({formatHours(session.total_hours)} hrs)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rejection Reason */}
            <div className="space-y-2">
              <Label htmlFor="rejection-remarks" className="text-foreground font-semibold">
                Reason for Rejection <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-remarks"
                placeholder="Please provide a detailed reason for rejecting this OT request (minimum 10 characters)..."
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  setError('');
                }}
                rows={4}
                className="resize-none"
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {remarks.length}/10 characters minimum
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading || !remarks.trim() || remarks.trim().length < 10}
          >
            <XCircle className="h-4 w-4 mr-2" />
            {isLoading ? 'Rejecting...' : 'Submit Rejection'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
