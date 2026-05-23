import React from 'react';
import { CheckCircle2, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UseMutationResult } from '@tanstack/react-query';
import type { SessionExecution } from '../types';

interface SessionCompletionGateProps {
  execution?: SessionExecution;
  isGuide: boolean;
  end: UseMutationResult<SessionExecution, Error, void>;
  complete: UseMutationResult<SessionExecution, Error, void>;
}

export const SessionCompletionGate: React.FC<SessionCompletionGateProps> = ({
  execution,
  isGuide,
  end,
  complete,
}) => {
  const ended = Boolean(execution?.endedAt);
  const completionAvailable = Boolean(execution?.participants.menteeJoined && execution?.startedAt);
  const reflectionUnlocked = Boolean(execution?.gates.reflectionUnlocked);
  const canEnd = Boolean(isGuide && execution?.startedAt && !ended);

  if (reflectionUnlocked) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-success/25 bg-success/10 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <p className="text-body-sm font-semibold text-foreground">Session ended by mentor. Reflections and reviews are unlocked.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-background p-4 space-y-sm">
      <div className="flex items-start gap-2">
        {completionAvailable ? (
          <ShieldCheck className="h-4 w-4 text-success mt-0.5" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground mt-0.5" />
        )}
        <div>
          <p className="text-body-sm font-semibold text-foreground">
            {completionAvailable ? 'Ready to unlock reflection' : 'Reflection locked'}
          </p>
          <p className="text-xs text-muted-foreground">
            Reflection unlocks after the mentee joins and the mentor ends the session.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-sm">
        {canEnd && (
          <Button variant="outline" size="sm" onClick={() => end.mutate()} disabled={end.isPending}>
            {end.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            End Session
          </Button>
        )}
        {isGuide && ended && !reflectionUnlocked && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => complete.mutate()}
            disabled={!completionAvailable || complete.isPending}
          >
            {complete.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Complete Session
          </Button>
        )}
      </div>
    </div>
  );
};
