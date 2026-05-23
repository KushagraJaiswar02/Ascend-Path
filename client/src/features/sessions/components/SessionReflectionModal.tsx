import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSubmitReflection } from '../hooks/useSessionReflection';

interface SessionReflectionModalProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: {
    learnings?: string;
    confidenceLevel?: number;
    nextChallenge?: string;
  };
}

export const SessionReflectionModal: React.FC<SessionReflectionModalProps> = ({
  sessionId,
  open,
  onOpenChange,
  initialValues,
}) => {
  const mutation = useSubmitReflection(sessionId);
  const [learnings, setLearnings] = useState(initialValues?.learnings || '');
  const [confidenceLevel, setConfidenceLevel] = useState(initialValues?.confidenceLevel || 3);
  const [nextChallenge, setNextChallenge] = useState(initialValues?.nextChallenge || '');

  const canSubmit = learnings.trim().length >= 10 && nextChallenge.trim().length >= 5;

  const handleSubmit = () => {
    if (!canSubmit) return;
    mutation.mutate(
      { learnings, confidenceLevel, nextChallenge },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Capture Session Learnings</DialogTitle>
          <DialogDescription>
            Turn this mentorship session into your next learning loop.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-md">
          <div className="space-y-xs">
            <label className="text-body-xs font-bold text-foreground">What did you learn?</label>
            <Textarea value={learnings} onChange={(event) => setLearnings(event.target.value)} rows={4} />
          </div>

          <div className="space-y-xs">
            <label className="text-body-xs font-bold text-foreground">Confidence</label>
            <div className="flex gap-xs">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={confidenceLevel === value ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setConfidenceLevel(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-xs">
            <label className="text-body-xs font-bold text-foreground">Biggest remaining challenge</label>
            <Textarea value={nextChallenge} onChange={(event) => setNextChallenge(event.target.value)} rows={3} />
          </div>

          {mutation.isError && (
            <p className="text-[11px] font-semibold text-destructive">
              Could not save your reflection. Please try again.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Later
          </Button>
          <Button variant="primary" size="sm" disabled={!canSubmit || mutation.isPending} onClick={handleSubmit}>
            {mutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Save reflection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
