import React from 'react';
import { useBookSessionMutation } from '../hooks/useGuideProfile';
import { useToast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign } from 'lucide-react';

interface BookSessionDialogProps {
  guideName: string;
  openSessions: any[];
  isOpen: boolean;
  onClose: () => void;
}

export const BookSessionDialog: React.FC<BookSessionDialogProps> = ({
  guideName,
  openSessions,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const bookMutation = useBookSessionMutation();

  const handleBook = (sessionId: string, title: string) => {
    bookMutation.mutate(sessionId, {
      onSuccess: () => {
        toast({
          title: 'Session Booked!',
          description: `You have successfully booked "${title}" with ${guideName}. Check your dashboard for details!`,
          type: 'success',
        });
        onClose();
      },
      onError: (err: any) => {
        const errMsg = err.response?.data?.message || 'Failed to book session. Please try again.';
        toast({
          title: 'Booking Failed',
          description: errMsg,
          type: 'error',
        });
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto border border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-heading-sm font-extrabold text-foreground select-none">
            Book a Session with {guideName}
          </DialogTitle>
          <DialogDescription className="text-body-sm text-muted-foreground select-none">
            Select one of the available study slots below to book immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-sm mt-md">
          {openSessions.length === 0 ? (
            <div className="text-center py-xl border border-dashed border-border rounded-xl select-none">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-xs" />
              <h3 className="text-body-md font-bold text-foreground">No sessions available</h3>
              <p className="text-muted-sm text-muted-foreground max-w-xs mx-auto mt-xxs">
                {guideName} hasn't listed any open slots. Ping them to request a new slot!
              </p>
            </div>
          ) : (
            <div className="space-y-sm">
              {openSessions.map((session) => (
                <div
                  key={session._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-md border border-border rounded-xl bg-muted/20 hover:bg-muted/40 hover:border-border/80 transition-all gap-md"
                >
                  <div className="space-y-xxs">
                    <h4 className="text-body-md font-extrabold text-foreground leading-snug">
                      {session.title}
                    </h4>
                    <p className="text-muted-sm text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                      Topic: {session.topic}
                    </p>

                    <div className="flex flex-wrap gap-x-md gap-y-xxs text-muted-foreground text-body-xs font-medium pt-xs">
                      <span className="inline-flex items-center gap-xxs">
                        <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{formatDate(session.scheduledAt)}</span>
                      </span>
                      <span className="inline-flex items-center gap-xxs">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>
                          {formatTime(session.scheduledAt)} ({session.durationMinutes}m)
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-xxs font-semibold">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className={session.price === 0 ? 'text-emerald-600 font-bold' : 'text-foreground'}>
                          {session.price === 0 ? 'Free' : `$${session.price}`}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 select-none">
                    <Button
                      onClick={() => handleBook(session._id, session.title)}
                      disabled={bookMutation.isPending}
                      className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/95 text-body-xs font-bold px-md py-xs rounded-lg shadow-sm"
                    >
                      {bookMutation.isPending ? 'Booking...' : 'Book Now'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
