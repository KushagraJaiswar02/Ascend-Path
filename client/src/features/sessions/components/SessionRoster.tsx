import React from 'react';
import { CheckCircle2, Circle, UserRound, UsersRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Session, SessionExecution } from '../types';

interface SessionRosterProps {
  session: Session;
  execution?: SessionExecution;
  isGuide: boolean;
}

const initials = (name?: string) =>
  (name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export const SessionRoster: React.FC<SessionRosterProps> = ({ session, execution, isGuide }) => {
  if (!isGuide) return null;

  const mentee = session.clientId || session.explorerId;
  const mentorJoined = Boolean(execution?.participants.mentorJoined || session.mentorJoinedAt);
  const menteeJoined = Boolean(execution?.participants.menteeJoined || session.menteeJoinedAt);

  return (
    <div className="rounded-md border border-border bg-muted/20 p-md space-y-sm">
      <div className="flex items-center justify-between gap-sm">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Enrollment</p>
          <h3 className="text-body-sm font-bold text-foreground flex items-center gap-xs">
            <UsersRound className="h-4 w-4 text-primary" />
            Session roster
          </h3>
        </div>
        <Badge variant={mentee ? 'success' : 'outline'} className="text-[10px]">
          {mentee ? '1 enrolled' : 'No enrollee'}
        </Badge>
      </div>

      {mentee ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
          <div className="flex items-center gap-sm rounded-md border border-border bg-background px-3 py-2">
            <Avatar className="h-8 w-8">
              {mentee.avatar && <AvatarImage src={mentee.avatar} alt={mentee.name} />}
              <AvatarFallback className="text-xs">{initials(mentee.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-semibold text-foreground truncate">{mentee.name}</p>
              <p className="text-[11px] text-muted-foreground">Enrolled mentee</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
              {mentorJoined ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
              <span className="text-xs font-semibold text-foreground">Mentor joined</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
              {menteeJoined ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
              <span className="text-xs font-semibold text-foreground">Mentee joined</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-sm rounded-md border border-border bg-background px-3 py-3">
          <UserRound className="h-4 w-4 text-muted-foreground" />
          <p className="text-body-sm text-muted-foreground">No mentee has enrolled in this session yet.</p>
        </div>
      )}
    </div>
  );
};
