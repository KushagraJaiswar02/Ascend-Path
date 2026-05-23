import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Video } from 'lucide-react';
import { EmptyState } from '@/components/layout/EmptyState';

interface UpcomingSessionsProps {
  sessions: any[];
}

export const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({ sessions }) => {
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground shadow-subtle overflow-hidden transition-all duration-300 hover:border-border/80">
      <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-border/50 bg-muted/10 select-none">
        <CardTitle className="text-card-title font-bold text-foreground">
          Upcoming Sessions
        </CardTitle>
        <span 
          onClick={() => navigate('/sessions')}
          className="text-metadata font-semibold text-primary hover:underline cursor-pointer"
        >
          View Calendar
        </span>
      </CardHeader>
      
      <CardContent className="p-5 flex-grow flex flex-col justify-between">
        {sessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No sessions scheduled"
            description="Complete your goals and schedule a session with a mentor for 1-on-1 feedback."
            className="border-none bg-transparent min-h-[220px] p-0 shadow-none"
            action={{
              label: "Explore Mentors",
              onClick: () => navigate("/explore")
            }}
          />
        ) : (
          <ul className="flex flex-col gap-3 flex-grow">
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
                  className="flex gap-4 items-center p-4 border border-border/60 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors duration-250"
                >
                  {/* Premium, muted grey date capsule */}
                  <div className="flex flex-col items-center justify-center bg-muted/80 text-muted-foreground border border-border/60 rounded-xl py-2 px-1 min-w-[56px] text-center select-none shadow-subtle shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 leading-none mb-1">
                      {month}
                    </span>
                    <span className="text-section-title font-bold text-foreground leading-none">
                      {day}
                    </span>
                  </div>
                  
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-body-p font-semibold text-foreground truncate leading-snug">
                        {session.topic || 'Mentorship Session'}
                      </h3>
                      {isLive && <Badge variant="success" className="animate-pulse">Live</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-metadata text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-4.5 w-4.5">
                          <AvatarFallback className="text-[8px] font-bold">
                            {guideInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">With {session.guideId?.name || 'Guide'}</span>
                      </div>
                      <div className="flex items-center gap-1">
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

