import React from 'react';
import { Loader2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/useAuthStore';
import { useRegisterPublicSession } from '../hooks/usePublicSessions';
import type { Session } from '../types';

interface SessionRegistrationPanelProps {
  session: Session;
}

const getId = (value: any) => value?._id || value;

export const SessionRegistrationPanel: React.FC<SessionRegistrationPanelProps> = ({ session }) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const registerMutation = useRegisterPublicSession();

  const isHost = user?._id === session.guideId._id;
  const isRegistered = !!user && session.attendees?.some((attendee) => getId(attendee.userId) === user._id);
  const isFull = !!session.capacity && (session.attendeeCount || 0) >= session.capacity;
  const disabled = isHost || isRegistered || isFull || session.status === 'live' || session.status === 'ended';

  const handleRegister = () => {
    registerMutation.mutate(session._id, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Registered',
          description: 'You are on the attendee list for this workshop.',
        });
      },
      onError: (error: any) => {
        toast({
          type: 'error',
          title: 'Could not register',
          description: error?.response?.data?.error || 'Please try again in a moment.',
        });
      },
    });
  };

  return (
    <Button
      type="button"
      variant={isRegistered ? 'secondary' : 'primary'}
      size="md"
      className="w-full"
      onClick={handleRegister}
      disabled={disabled || registerMutation.isPending}
    >
      {registerMutation.isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          Registering...
        </>
      ) : isHost ? (
        'You host this workshop'
      ) : isRegistered ? (
        <>
          <UserCheck className="h-4 w-4 mr-1.5" />
          Registered
        </>
      ) : isFull ? (
        'Workshop full'
      ) : (
        'Register for workshop'
      )}
    </Button>
  );
};
