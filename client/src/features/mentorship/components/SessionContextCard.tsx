import { CalendarDays, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const SessionContextCard = ({ session }: { session?: any }) => {
  if (!session) return null;
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Private session context</p>
          <h3 className="mt-1 text-sm font-bold text-foreground">{session.title || session.topic}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
            {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : 'Time pending'}
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={`/sessions/${session._id}`}>
            <Video className="h-4 w-4" />
            Open
          </Link>
        </Button>
      </div>
    </div>
  );
};
