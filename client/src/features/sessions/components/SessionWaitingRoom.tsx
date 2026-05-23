import React, { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import type { Session } from '../types';

interface SessionWaitingRoomProps {
  session: Session;
  isJoinAvailable?: boolean;
}

const formatRemaining = (milliseconds: number) => {
  if (milliseconds <= 0) return 'Ready now';
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

export const SessionWaitingRoom: React.FC<SessionWaitingRoomProps> = ({ session, isJoinAvailable = false }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const scheduledAt = new Date(session.scheduledAt).getTime();
  const remaining = scheduledAt - now;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm rounded-md border border-border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-body-sm font-semibold text-foreground">Waiting room</p>
          <p className="text-xs text-muted-foreground">
            {isJoinAvailable
              ? 'The scheduled time has arrived. Meeting controls are available.'
              : 'Meeting controls appear at the scheduled session time.'}
          </p>
        </div>
      </div>
      <span className="text-body-sm font-bold text-foreground">{formatRemaining(remaining)}</span>
    </div>
  );
};
