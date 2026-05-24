import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Tags } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Session } from '../types';
import { SessionAttendanceStrip } from './SessionAttendanceStrip';
import { SessionRegistrationPanel } from './SessionRegistrationPanel';

interface PublicWorkshopCardProps {
  session: Session;
}

const categoryLabel = (value?: string) => (value || 'workshop').replace(/_/g, ' ');

export const PublicWorkshopCard: React.FC<PublicWorkshopCardProps> = ({ session }) => {
  const date = new Date(session.scheduledAt);
  const initials = session.guideId.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="overflow-hidden border border-border bg-card shadow-subtle rounded-2xl flex flex-col">
      <div className="h-28 bg-muted relative">
        {session.bannerImage || session.thumbnail ? (
          <img src={session.bannerImage || session.thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,rgba(20,184,166,0.22),rgba(99,102,241,0.14),rgba(245,158,11,0.16))]" />
        )}
        <Badge className="absolute left-3 top-3 capitalize" variant={session.status === 'live' ? 'success' : 'secondary'}>
          {session.status === 'live' ? 'Live now' : categoryLabel(session.sessionCategory)}
        </Badge>
      </div>

      <CardContent className="p-5 flex-1 space-y-4">
        <div>
          <Link to={`/sessions/${session._id}`} className="group">
            <h3 className="text-card-title font-black text-foreground leading-snug group-hover:text-primary transition">
              {session.title || session.topic}
            </h3>
          </Link>
          <p className="mt-1 text-metadata text-muted-foreground line-clamp-2 leading-relaxed">
            {session.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </span>
          {session.difficulty && (
            <span className="capitalize">{session.difficulty}</span>
          )}
        </div>

        <SessionAttendanceStrip attendeeCount={session.attendeeCount} capacity={session.capacity} />

        {!!session.tags?.length && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
            <Tags className="h-3 w-3" />
            <span className="truncate">{session.tags.slice(0, 3).join(', ')}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 pt-3 border-t border-border/40">
          <Avatar className="h-8 w-8">
            {session.guideId.avatar && <AvatarImage src={session.guideId.avatar} alt={session.guideId.name} />}
            <AvatarFallback className="text-[10px] font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Hosted by</p>
            <p className="truncate text-xs font-bold text-foreground">{session.guideId.name}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 py-4 border-t border-border bg-muted/15">
        <SessionRegistrationPanel session={session} />
      </CardFooter>
    </Card>
  );
};
