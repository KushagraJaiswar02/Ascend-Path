import React, { useState } from 'react';
import { useReportReviewMutation } from '../hooks/useReviews';
import { useToast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface ReviewReportDialogProps {
  reviewId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewReportDialog: React.FC<ReviewReportDialogProps> = ({
  reviewId,
  isOpen,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  
  const { toast } = useToast();
  const reportMutation = useReportReviewMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (reason.trim().length < 5) {
      setError('Report reason must be at least 5 characters long');
      return;
    }

    reportMutation.mutate(
      { reviewId, reason: reason.trim() },
      {
        onSuccess: () => {
          toast({
            title: 'Report Submitted',
            description: 'This review has been flagged and sent to moderators for content review.',
            type: 'success',
          });
          setReason('');
          onClose();
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || 'Failed to submit report. Please try again.';
          toast({
            title: 'Error',
            description: errMsg,
            type: 'error',
          });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] border border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-heading-sm font-extrabold text-foreground flex items-center gap-xs select-none">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <span>Flag Review for Abuse</span>
          </DialogTitle>
          <DialogDescription className="text-body-sm text-muted-foreground select-none">
            If this review contains spam, reciprocal boosting, toxic remarks, or violates guidelines, flag it below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-md mt-sm">
          <div className="space-y-xs">
            <label htmlFor="reason" className="text-body-xs font-bold text-foreground">
              Reason for reporting <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="reason"
              placeholder="e.g. This review is fake; this student did not actually complete a session or is swapping reviews."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={4}
              required
              className="resize-none border border-border focus-visible:ring-1 focus-visible:ring-ring text-body-sm"
            />
            {error && (
              <p className="text-destructive text-[11px] font-semibold mt-xs select-none">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-sm pt-sm select-none">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={reportMutation.isPending}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={reportMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/95"
            >
              {reportMutation.isPending ? 'Submitting...' : 'Flag Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
