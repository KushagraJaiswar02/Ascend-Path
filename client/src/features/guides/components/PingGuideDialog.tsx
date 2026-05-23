import React, { useState } from 'react';
import { usePingGuideMutation } from '../hooks/useGuideProfile';
import { useToast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PingGuideDialogProps {
  guideId: string;
  guideName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PingGuideDialog: React.FC<PingGuideDialogProps> = ({
  guideId,
  guideName,
  isOpen,
  onClose,
}) => {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [error, setError] = useState('');
  
  const { toast } = useToast();
  const pingMutation = usePingGuideMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (question.trim().length < 10) {
      setError('Question must be at least 10 characters long');
      return;
    }

    pingMutation.mutate(
      {
        toUserId: guideId,
        question: question.trim(),
        context: context.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Ping Sent!',
            description: `Your question has been sent to ${guideName}. You will be notified when they respond.`,
            type: 'success',
          });
          setQuestion('');
          setContext('');
          onClose();
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || 'Failed to send Ping. Please try again.';
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
      <DialogContent className="sm:max-w-[500px] border border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-heading-sm font-extrabold text-foreground select-none">
            Ping {guideName}
          </DialogTitle>
          <DialogDescription className="text-body-sm text-muted-foreground select-none">
            Ask a quick technical question or seek career guidance. Keep it clear and concise.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-md mt-sm">
          <div className="space-y-xs">
            <label htmlFor="question" className="text-body-xs font-bold text-foreground">
              Your Question <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="question"
              placeholder="e.g. Can you explain the difference between consistency and availability in database scaling?"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
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

          <div className="space-y-xs">
            <label htmlFor="context" className="text-body-xs font-bold text-foreground">
              Context (Optional)
            </label>
            <Textarea
              id="context"
              placeholder="e.g. I am building a microservices application using Node.js and MongoDB."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              className="resize-none border border-border focus-visible:ring-1 focus-visible:ring-ring text-body-sm"
            />
          </div>

          <div className="flex justify-end gap-sm pt-sm select-none">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pingMutation.isPending}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pingMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/95"
            >
              {pingMutation.isPending ? 'Sending...' : 'Send Ping'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
