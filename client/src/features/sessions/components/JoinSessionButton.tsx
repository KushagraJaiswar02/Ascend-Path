import React from 'react';
import { ExternalLink, Loader2, Play, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Session, SessionExecution } from '../types';

interface JoinSessionButtonProps {
  session: Session;
  execution?: SessionExecution;
  isGuide: boolean;
  start: UseMutationResult<SessionExecution, Error, void>;
  join: UseMutationResult<SessionExecution, Error, void>;
}

export const JoinSessionButton: React.FC<JoinSessionButtonProps> = ({
  session,
  execution,
  isGuide,
  start,
  join,
}) => {
  const isStarted = Boolean(execution?.startedAt || session.startedAt);
  const isPending = start.isPending || join.isPending;
  const disabled = session.status !== 'booked' || Boolean(execution?.endedAt);

  const handleClick = async () => {
    const result = isGuide && !isStarted ? await start.mutateAsync() : await join.mutateAsync();
    if (result.meetingUrl) {
      window.open(result.meetingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Button
      type="button"
      variant="primary"
      size="md"
      onClick={handleClick}
      disabled={disabled || isPending}
      className="w-full sm:w-auto"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isGuide && !isStarted ? (
        <Play className="h-4 w-4 mr-2" />
      ) : execution?.meetingUrl ? (
        <ExternalLink className="h-4 w-4 mr-2" />
      ) : (
        <Video className="h-4 w-4 mr-2" />
      )}
      {isGuide && !isStarted ? 'Start Session' : 'Join Session'}
    </Button>
  );
};
