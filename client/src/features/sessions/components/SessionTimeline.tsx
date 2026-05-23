import React from 'react';
import { CheckCircle2, CircleDot, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SessionExecution } from '../types';

interface SessionTimelineProps {
  execution?: SessionExecution;
}

const states = [
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'started', label: 'Room opened' },
  { key: 'active', label: 'Both joined' },
  { key: 'ended', label: 'Ended' },
  { key: 'reflection_unlocked', label: 'Reflection unlocked' },
];

const stateRank: Record<string, number> = {
  scheduled: 0,
  started: 1,
  participants_joined: 1,
  active: 2,
  ended: 3,
  reflection_unlocked: 4,
};

export const SessionTimeline: React.FC<SessionTimelineProps> = ({ execution }) => {
  const currentRank = stateRank[execution?.sessionExecutionState || 'scheduled'] || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-sm">
      {states.map((state, index) => {
        const complete = index < currentRank;
        const current = index === currentRank;
        return (
          <div
            key={state.key}
            className={cn(
              'flex items-center gap-2 rounded-md border px-3 py-2 min-h-10',
              complete || current ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20'
            )}
          >
            {complete ? (
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            ) : current ? (
              <CircleDot className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className={cn('text-xs font-semibold', complete || current ? 'text-foreground' : 'text-muted-foreground')}>
              {state.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
