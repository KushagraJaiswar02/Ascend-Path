import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Timer } from 'lucide-react';

import type { Session } from '../types';
import { BookSessionButton } from './BookSessionButton';
import { useAuthStore } from '../../../store/useAuthStore';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SessionCardProps {
  session: Session;
  showBookingAction?: boolean;
}

const statusVariantMap: Record<
  Session['status'],
  { label: string; variant: 'success' | 'outline' | 'secondary' | 'destructive' }
> = {
  open: { label: 'Open Available', variant: 'success' },
  booked: { label: 'Booked Scheduled', variant: 'secondary' },
  completed: { label: 'Completed Done', variant: 'outline' },
  cancelled: { label: 'Cancelled Null', variant: 'destructive' },
};

export const SessionCard: React.FC<SessionCardProps> = memo(({
  session,
  showBookingAction = true,
}) => {
  const { user } = useAuthStore();
  const dateObj = new Date(session.scheduledAt);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const { label: statusLabel, variant: statusVariant } = statusVariantMap[session.status];
  const guideInitials = session.guideId.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const isOwnSession = user?._id === session.guideId._id;

  return (
    <Card 
      className={cn(
        'flex flex-col border border-border bg-card text-card-foreground shadow-subtle rounded-2xl transition-all duration-300',
        'hover:shadow-medium hover:border-border/80 relative overflow-hidden group'
      )}
    >
      {/* Visual Indicator of a premium card */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-primary/25 transition-colors duration-300" />

      {/* Card Body */}
      <CardContent className="p-5 flex-1 flex flex-col gap-4 mt-[2px]">
        {/* Status row + Price tag */}
        <div className="flex items-center justify-between gap-2 select-none">
          <Badge 
            variant={statusVariant} 
            className="capitalize tracking-wider text-[10px] font-bold px-2.5 py-0.5"
          >
            {statusLabel}
          </Badge>
          <span className="text-[11px] font-bold text-primary bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-lg px-2.5 py-0.5">
            {session.price === 0 ? 'Free' : `$${session.price}`}
          </span>
        </div>

        {/* Topic + Description */}
        <div className="space-y-1.5">
          <Link to={`/sessions/${session._id}`} className="group/link block">
            <h3 className="text-card-title font-bold text-foreground group-hover/link:text-primary transition-colors leading-snug">
              {session.topic}
            </h3>
          </Link>
          <p className="text-metadata text-muted-foreground line-clamp-2 leading-relaxed">
            {session.description}
          </p>
        </div>

        {/* Schedule metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-metadata text-muted-foreground select-none">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
            {formattedTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
            {session.duration} mins
          </span>
        </div>

        {/* Guide info */}
        <div className="flex items-center gap-2.5 mt-auto pt-3 border-t border-border/40 select-none">
          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border/50">
            {session.guideId.avatar && <AvatarImage src={session.guideId.avatar} alt={session.guideId.name} />}
            <AvatarFallback className="text-[10px] font-bold bg-muted">{guideInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground leading-none mb-0.5 uppercase tracking-wider">Mentor</p>
            <p className="text-metadata font-bold text-foreground truncate">{session.guideId.name}</p>
          </div>
        </div>
      </CardContent>

      {/* Booking CTA footer */}
      {showBookingAction && (
        <CardFooter className="px-5 py-4 border-t border-border bg-muted/15 select-none">
          <BookSessionButton
            sessionId={session._id}
            status={session.status}
            price={session.price}
            topic={session.topic}
            isOwnSession={isOwnSession}
          />
        </CardFooter>
      )}
    </Card>
  );
});

SessionCard.displayName = 'SessionCard';

