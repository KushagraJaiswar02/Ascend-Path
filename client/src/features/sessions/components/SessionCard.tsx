import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Timer } from 'lucide-react';
import type { Session } from '../types';
import { BookSessionButton } from './BookSessionButton';
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
  open: { label: 'Open', variant: 'success' },
  booked: { label: 'Booked', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export const SessionCard: React.FC<SessionCardProps> = memo(({
  session,
  showBookingAction = true,
}) => {
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

  return (
    <Card className={cn('flex flex-col hover:shadow-medium transition-shadow duration-200')}>
      {/* Card Body */}
      <CardContent className="p-5 flex-1 flex flex-col gap-4">
        {/* Status row + Price tag */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant={statusVariant} className="capitalize tracking-wide text-xs font-semibold">
            {statusLabel}
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-md px-2 py-0.5">
            {session.price === 0 ? 'Free' : `$${session.price}`}
          </span>
        </div>

        {/* Topic + Description */}
        <div>
          <Link to={`/sessions/${session._id}`} className="group block">
            <h3 className="text-body-md font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1">
              {session.topic}
            </h3>
          </Link>
          <p className="text-muted-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {session.description}
          </p>
        </div>

        {/* Schedule metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {formattedTime}
          </span>
          <span className="flex items-center gap-1">
            <Timer className="h-3.5 w-3.5 shrink-0" />
            {session.duration}m
          </span>
        </div>

        {/* Guide info */}
        <div className="flex items-center gap-2.5 mt-auto">
          <Avatar className="h-8 w-8 shrink-0">
            {session.guideId.avatar && <AvatarImage src={session.guideId.avatar} alt={session.guideId.name} />}
            <AvatarFallback className="text-xs">{guideInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground leading-none mb-0.5">Guide</p>
            <p className="text-body-sm font-medium text-foreground truncate">{session.guideId.name}</p>
          </div>
        </div>
      </CardContent>

      {/* Booking CTA footer */}
      {showBookingAction && (
        <CardFooter className="px-5 py-4 border-t border-border bg-muted/30">
          <BookSessionButton
            sessionId={session._id}
            status={session.status}
            price={session.price}
            topic={session.topic}
          />
        </CardFooter>
      )}
    </Card>
  );
});

SessionCard.displayName = 'SessionCard';
