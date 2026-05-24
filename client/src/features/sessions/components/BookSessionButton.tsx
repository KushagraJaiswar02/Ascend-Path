import React, { useState } from 'react';
import { useBookSession } from '../hooks/useBookSession';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { CalendarCheck, Loader2 } from 'lucide-react';

interface BookSessionButtonProps {
  sessionId: string;
  status: 'open' | 'booked' | 'started' | 'active' | 'completed' | 'cancelled' | 'scheduled' | 'registration_open' | 'live' | 'ended' | 'archived';
  price: number;
  topic?: string;
  isOwnSession?: boolean;
}

export const BookSessionButton: React.FC<BookSessionButtonProps> = ({
  sessionId,
  status,
  price,
  topic,
  isOwnSession = false,
}) => {
  const bookMutation = useBookSession();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const isBooked = status === 'booked';

  if (status === 'completed') {
    return (
      <span className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed select-none">
        Completed
      </span>
    );
  }

  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed select-none">
        Cancelled
      </span>
    );
  }

  if (isBooked) {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border border-border bg-muted text-muted-foreground cursor-not-allowed select-none">
        <CalendarCheck className="h-4 w-4" />
        Booked
      </span>
    );
  }

  if (isOwnSession) {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border border-border bg-muted text-muted-foreground cursor-not-allowed select-none w-full">
        Your hosted session
      </span>
    );
  }

  const handleConfirmBook = () => {
    bookMutation.mutate(sessionId, {
      onSuccess: () => {
        setDialogOpen(false);
        toast({
          type: 'success',
          title: 'Session Reserved',
          description: topic
            ? `You have successfully booked "${topic}".`
            : 'Your session slot has been confirmed.',
        });
      },
      onError: (error: any) => {
        setDialogOpen(false);
        toast({
          type: 'error',
          title: 'Booking Failed',
          description: error?.response?.data?.error || 'Something went wrong. Please try again in a moment.',
        });
      },
    });
  };

  const priceLabel = price === 0 ? 'Free' : `$${price}`;

  return (
    <>
      <Button
        id={`book-session-${sessionId}`}
        variant="primary"
        size="md"
        className="w-full"
        onClick={() => setDialogOpen(true)}
        disabled={bookMutation.isPending}
      >
        {bookMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            Reserving…
          </>
        ) : (
          `Book Session — ${priceLabel}`
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm your booking</DialogTitle>
            <DialogDescription>
              {topic ? (
                <>
                  You're about to reserve a spot for{' '}
                  <span className="font-medium text-foreground">"{topic}"</span>.{' '}
                </>
              ) : (
                "You're about to reserve a session slot. "
              )}
              {price === 0
                ? 'This session is free.'
                : `This session costs $${price}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDialogOpen(false)}
              disabled={bookMutation.isPending}
            >
              Go back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmBook}
              disabled={bookMutation.isPending}
            >
              {bookMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Reserving…
                </>
              ) : (
                'Confirm booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
