import React from 'react';
import { CheckCircle2, Circle, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SessionExecution } from '../types';

interface LiveAttendanceIndicatorProps {
  execution?: SessionExecution;
}

export const LiveAttendanceIndicator: React.FC<LiveAttendanceIndicatorProps> = ({ execution }) => {
  const mentorJoined = execution?.participants.mentorJoined;
  const menteeJoined = execution?.participants.menteeJoined;
  const isActive = execution?.attendanceStatus === 'active';

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-center gap-sm flex-wrap">
        <Badge variant={isActive ? 'success' : 'secondary'} className="gap-1.5">
          <Radio className="h-3 w-3" />
          {execution?.attendanceStatus || 'scheduled'}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {execution?.actualDurationMinutes || 0} tracked minutes
        </span>
      </div>

      <div className="grid grid-cols-2 gap-sm">
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
          {mentorJoined ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
          <span className="text-body-sm font-medium">Mentor</span>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
          {menteeJoined ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
          <span className="text-body-sm font-medium">Mentee</span>
        </div>
      </div>
    </div>
  );
};
