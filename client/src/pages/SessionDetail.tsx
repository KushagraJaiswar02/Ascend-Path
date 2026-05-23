import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Timer,
  Star,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useSession } from '../features/sessions/hooks/useSession';
import { useSessionReflection } from '../features/sessions/hooks/useSessionReflection';
import { useCancelSession } from '../features/sessions/hooks/useCancelSession';
import { useRateSession } from '../features/sessions/hooks/useRateSession';
import { BookSessionButton } from '../features/sessions/components/BookSessionButton';
import { SessionReflectionModal } from '../features/sessions/components/SessionReflectionModal';
import { MentorFollowupPanel } from '../features/sessions/components/MentorFollowupPanel';
import { ReflectionSummaryCard } from '../features/sessions/components/ReflectionSummaryCard';
import { MentorRecommendationCard } from '../features/sessions/components/MentorRecommendationCard';
import { SessionExecutionPanel } from '../features/sessions/components/SessionExecutionPanel';
import { useAuthStore } from '../store/useAuthStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import type { Session } from '../features/sessions/types';
import { cn } from '@/lib/utils';

// ── Status badge map ─────────────────────────────────────────────────────────
const statusVariantMap: Record<
  Session['status'],
  { label: string; variant: 'success' | 'secondary' | 'outline' | 'destructive' }
> = {
  open:      { label: 'Open for Booking',  variant: 'success' },
  booked:    { label: 'Booked',            variant: 'secondary' },
  completed: { label: 'Completed',         variant: 'outline' },
  cancelled: { label: 'Cancelled',         variant: 'destructive' },
};

// ── Star rating interactive picker ───────────────────────────────────────────
const StarPicker: React.FC<{
  value: number;
  onChange: (v: number) => void;
}> = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            className="p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors duration-100',
                filled
                  ? 'text-warning fill-warning'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        );
      })}
      <span className="ml-2 text-body-sm text-muted-foreground">
        {value} / 5
      </span>
    </div>
  );
};

// ── Static star display ───────────────────────────────────────────────────────
const StarDisplay: React.FC<{ value: number }> = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={cn(
          'h-4 w-4',
          star <= value ? 'text-warning fill-warning' : 'text-muted-foreground'
        )}
      />
    ))}
    <span className="ml-1.5 text-body-sm text-muted-foreground font-medium">{value}/5</span>
  </div>
);

// ── Loading skeleton ──────────────────────────────────────────────────────────
const DetailSkeleton = () => (
  <PageContainer size="tight">
    <Skeleton className="h-4 w-32 mb-xl" />
    <div className="space-y-lg">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-5 w-24 rounded-full" />
      <div className="grid grid-cols-2 gap-md mt-lg">
        <Skeleton className="h-24 rounded-md" />
        <Skeleton className="h-24 rounded-md" />
      </div>
      <Skeleton className="h-32 rounded-md" />
      <Skeleton className="h-12 rounded-md" />
    </div>
  </PageContainer>
);

// ── Main component ────────────────────────────────────────────────────────────
export const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const { data: session, isLoading, isError } = useSession(id || '');
  const reflectionQuery = useSessionReflection(id || '');
  const cancelMutation = useCancelSession();
  const rateMutation = useRateSession();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  // — Loading & error guards ——————————————————————————————————————————
  if (isLoading) return <DetailSkeleton />;
  if (isError || !session) {
    return (
      <PageContainer size="tight">
        <div className="flex flex-col items-center justify-center py-2xl text-center gap-sm">
          <AlertTriangle className="h-10 w-10 text-muted-foreground" />
          <h2 className="text-heading-xs font-semibold text-foreground">Session not found</h2>
          <p className="text-body-sm text-muted-foreground">
            This session may have been removed or doesn't exist.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-xs">
            <Link to="/sessions">Back to Sessions</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  // — Role & permission flags ————————————————————————————————————————
  const explorer = session.clientId || session.explorerId;
  const reflection = reflectionQuery.data;
  const isGuide    = user?._id === session.guideId._id;
  const isExplorer = user?._id === explorer?._id;
  const canCancel  = (isGuide || isExplorer) && (session.status === 'open' || session.status === 'booked');
  const canRate    = isExplorer && session.status === 'completed' && !session.rating;
  const canReflect = isExplorer && session.status === 'completed' && !reflection?.menteeReflection?.submittedAt;
  const canFollowup = isGuide && session.status === 'completed';
  const isParticipant = isGuide || isExplorer;

  // — Derived display values ————————————————————————————————————————
  const dateObj     = new Date(session.scheduledAt);
  const { label: statusLabel, variant: statusVariant } = statusVariantMap[session.status];
  const guideInitials = session.guideId.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // — Handlers ——————————————————————————————————————————————————————
  const handleConfirmCancel = () => {
    cancelMutation.mutate(session._id, {
      onSuccess: () => {
        setCancelDialogOpen(false);
        toast({
          type: 'success',
          title: 'Session cancelled',
          description: 'The session has been successfully cancelled.',
        });
      },
      onError: () => {
        setCancelDialogOpen(false);
        toast({
          type: 'error',
          title: 'Cancellation failed',
          description: 'Something went wrong. Please try again.',
        });
      },
    });
  };

  const handleRate = (e: React.FormEvent) => {
    e.preventDefault();
    const getErrorMessage = (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      return err.response?.data?.error || err.message || 'Could not save your review. Please try again.';
    };
    rateMutation.mutate(
      { sessionId: session._id, rating, review },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            title: 'Review submitted',
            description: 'Thanks for sharing your experience.',
          });
        },
        onError: (error) => {
          toast({
            type: 'error',
            title: 'Submission failed',
            description: getErrorMessage(error),
          });
        },
      }
    );
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <PageContainer size="tight">
      {/* Back navigation */}
      <Link
        to="/sessions"
        className="inline-flex items-center gap-1.5 text-body-sm text-muted-foreground hover:text-foreground transition-colors mb-lg group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
        Back to Sessions
      </Link>

      <div className="space-y-lg">
        {/* ── Overview card ─────────────────────────────────────────── */}
        <Card>
          <CardContent className="p-6 sm:p-8 space-y-md">
            {/* Status + price row */}
            <div className="flex items-center justify-between gap-sm flex-wrap">
              <Badge variant={statusVariant} className="capitalize tracking-wide text-xs font-semibold">
                {statusLabel}
              </Badge>
              <span className="text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-md px-2.5 py-1">
                {session.price === 0 ? 'Free' : `$${session.price}`}
              </span>
            </div>

            {/* Topic */}
            <h1 className="text-heading-md font-bold text-foreground leading-tight">
              {session.topic}
            </h1>

            {/* Guide + Schedule in two columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-xs">
              {/* Guide */}
              <div className="space-y-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Guide
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    {session.guideId.avatar && (
                      <AvatarImage src={session.guideId.avatar} alt={session.guideId.name} />
                    )}
                    <AvatarFallback>{guideInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-body-sm font-semibold text-foreground">
                      {session.guideId.name}
                    </p>
                    <p className="text-xs text-muted-foreground">Expert Mentor</p>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Schedule
                </p>
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-body-sm text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    {dateObj.toLocaleDateString(undefined, { dateStyle: 'full' })}
                  </span>
                  <span className="flex items-center gap-2 text-body-sm text-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    {dateObj.toLocaleTimeString(undefined, { timeStyle: 'short' })}
                  </span>
                  <span className="flex items-center gap-2 text-body-sm text-foreground">
                    <Timer className="h-4 w-4 text-muted-foreground shrink-0" />
                    {session.durationMinutes || session.duration} minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-xs pt-xs">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                About this session
              </p>
              <p className="text-body-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {session.description}
              </p>
            </div>

            {/* Booking CTA */}
            {session.status === 'open' && !isGuide && (
              <div className="pt-xs">
                <BookSessionButton
                  sessionId={session._id}
                  status={session.status}
                  price={session.price}
                  topic={session.topic}
                  isOwnSession={isGuide}
                />
              </div>
            )}

            {/* Cancel action — subtle but present */}
            {canCancel && (
              <div className="pt-xs">
                <Button
                  id="cancel-session-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={cancelMutation.isPending}
                  className="text-destructive border-destructive/20 hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Cancelling…
                    </>
                  ) : (
                    'Cancel Session'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session execution and attendance verification */}
        <SessionExecutionPanel session={session} isGuide={isGuide} isParticipant={isParticipant} />

        {/* ── Rate & review card ────────────────────────────────────── */}
        {canRate && (
          <Card>
            <CardHeader className="pb-sm">
              <CardTitle>Rate your experience</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleRate} className="space-y-md">
                <div className="space-y-xs">
                  <label className="text-body-sm font-semibold text-foreground">
                    Your rating
                  </label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>

                <div className="space-y-xs">
                  <label
                    htmlFor="review-text"
                    className="text-body-sm font-semibold text-foreground"
                  >
                    Feedback{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Textarea
                    id="review-text"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={3}
                    placeholder="How was the session? What did you learn?"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={rateMutation.isPending}
                >
                  {rateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ── Existing review display ───────────────────────────────── */}
        {session.rating && (
          <Card>
            <CardHeader className="pb-sm">
              <CardTitle>Explorer Feedback</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-sm">
              <StarDisplay value={session.rating} />
              {explorer && (
                <div className="flex items-center gap-2 mt-xs">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {explorer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-body-sm text-muted-foreground">
                    {explorer.name}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Cancel confirmation dialog ────────────────────────────────── */}
      {session.status === 'completed' && (isGuide || isExplorer) && (
        <div className="grid grid-cols-1 gap-md mt-lg">
          {isExplorer && (
            <>
              <ReflectionSummaryCard
                reflection={reflection}
                onAddReflection={canReflect ? () => setReflectionOpen(true) : undefined}
              />
              {reflection?.mentorFollowup?.submittedAt && <MentorRecommendationCard reflection={reflection} />}
            </>
          )}

          {canFollowup && (
            <>
              <ReflectionSummaryCard reflection={reflection} />
              <MentorFollowupPanel sessionId={session._id} reflection={reflection} />
            </>
          )}
        </div>
      )}

      {isExplorer && (
        <SessionReflectionModal
          sessionId={session._id}
          open={reflectionOpen}
          onOpenChange={setReflectionOpen}
          initialValues={reflection?.menteeReflection}
        />
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel this session?</DialogTitle>
            <DialogDescription>
              This will permanently cancel{' '}
              <span className="font-medium text-foreground">"{session.topic}"</span>.
              {' '}This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Keep session
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Cancelling…
                </>
              ) : (
                'Yes, cancel it'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};
