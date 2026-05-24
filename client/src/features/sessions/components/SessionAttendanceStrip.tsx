import React from 'react';
import { Users } from 'lucide-react';

interface SessionAttendanceStripProps {
  attendeeCount?: number;
  capacity?: number;
}

export const SessionAttendanceStrip: React.FC<SessionAttendanceStripProps> = ({ attendeeCount = 0, capacity }) => {
  const pct = capacity ? Math.min(100, Math.round((attendeeCount / capacity) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {attendeeCount} registered
        </span>
        {capacity ? <span>{capacity - attendeeCount} seats left</span> : <span>Open capacity</span>}
      </div>
      {capacity && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
};
