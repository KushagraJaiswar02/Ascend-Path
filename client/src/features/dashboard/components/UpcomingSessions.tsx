import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Video } from 'lucide-react';

interface UpcomingSessionsProps {
  sessions: any[];
}

export const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({ sessions }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground shadow-subtle overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-md border-b border-border/50 bg-muted/20">
        <CardTitle className="text-body-lg font-bold text-foreground">
          Upcoming Sessions
        </CardTitle>
        <span className="text-body-sm font-semibold text-muted-foreground cursor-not-allowed">
          View Calendar
        </span>
      </CardHeader>
      <CardContent className="p-md sm:p-lg flex-grow flex flex-col justify-between">
        {sessions.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-xl">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-md">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-body-md font-bold text-foreground mb-xs">No sessions scheduled</h3>
            <p className="text-muted-xs text-muted-foreground max-w-[240px] mb-md leading-normal">
              Need feedback or guidance? Book a session with an expert guide.
            </p>
            <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
              Book a Guide (Soon)
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-md flex-grow">
            {sessions.map((session) => {
              const scheduledDate = new Date(session.scheduledAt);
              const month = scheduledDate.toLocaleString('default', { month: 'short' });
              const day = scheduledDate.getDate();
              const time = scheduledDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });
              
              const guideInitials = session.guideId?.name
                ? session.guideId.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                : 'G';
              const isLive = ['waiting', 'active'].includes(session.attendanceStatus);
              const canJoin = session.status === 'booked' && scheduledDate.getTime() <= now && !session.endedAt;

              return (
                <li 
                  key={session._id} 
                  className="flex gap-md items-center p-md border border-border/50 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  {/* Premium, muted grey date capsule */}
                  <div className="flex flex-col items-center justify-center bg-muted text-muted-foreground border border-border rounded-lg py-sm px-xs min-w-[56px] text-center select-none shadow-subtle shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 leading-none mb-xs">
                      {month}
                    </span>
                    <span className="text-body-lg font-bold text-foreground leading-none">
                      {day}
                    </span>
                  </div>
                  
                  <div className="min-w-0 flex-1 space-y-xs">
                    <div className="flex items-center gap-xs min-w-0">
                      <h3 className="text-body-sm font-bold text-foreground truncate">
                        {session.topic || 'Mentorship Session'}
                      </h3>
                      {isLive && <Badge variant="success">Live</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-md gap-y-xs text-muted-xs text-muted-foreground">
                      <div className="flex items-center gap-xs">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px] font-bold">
                            {guideInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">With {session.guideId?.name || 'Guide'}</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <Clock className="h-3 w-3" />
                        <span>{time}</span>
                      </div>
                    </div>
                  </div>
                  {(canJoin || isLive) && (
                    <Button asChild variant={isLive ? 'primary' : 'outline'} size="sm" className="shrink-0">
                      <Link to={`/sessions/${session._id}`}>
                        <Video className="h-3.5 w-3.5 mr-1.5" />
                        Join
                      </Link>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
