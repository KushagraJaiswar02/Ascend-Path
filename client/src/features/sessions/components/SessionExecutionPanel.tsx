import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSessionExecution } from '../hooks/useSessionExecution';
import type { Session } from '../types';
import { JoinSessionButton } from './JoinSessionButton';
import { LiveAttendanceIndicator } from './LiveAttendanceIndicator';
import { SessionCompletionGate } from './SessionCompletionGate';
import { SessionRoster } from './SessionRoster';
import { SessionTimeline } from './SessionTimeline';
import { SessionWaitingRoom } from './SessionWaitingRoom';

interface SessionExecutionPanelProps {
  session: Session;
  isGuide: boolean;
  isParticipant: boolean;
}

const getErrorMessage = (error: unknown) => {
  const err = error as { response?: { data?: { error?: string } }; message?: string };
  return err.response?.data?.error || err.message || 'Session execution action failed.';
};

export const SessionExecutionPanel: React.FC<SessionExecutionPanelProps> = ({
  session,
  isGuide,
  isParticipant,
}) => {
  const execution = useSessionExecution(session._id);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const attachErrorToast = (mutation: { error: unknown }) => {
    if (!mutation.error) return null;
    return (
      <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2">
        <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
        <p className="text-xs text-destructive">{getErrorMessage(mutation.error)}</p>
      </div>
    );
  };

  if (!isParticipant || session.status === 'open') return null;

  const scheduledAt = new Date(session.scheduledAt).getTime();
  const hasSessionTimeArrived = now >= scheduledAt;
  const isEndedOrCompleted = Boolean(
    session.status === 'completed' ||
      session.status === 'cancelled' ||
      execution.data?.endedAt ||
      execution.data?.gates.reflectionUnlocked
  );
  const showMeetingControls = session.status === 'booked' && hasSessionTimeArrived && !isEndedOrCompleted;

  return (
    <Card>
      <CardHeader className="pb-sm">
        <CardTitle className="flex items-center gap-2">
          <Video className="h-4 w-4 text-muted-foreground" />
          Session Execution
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-md">
        <SessionRoster session={session} execution={execution.data} isGuide={isGuide} />
        <SessionWaitingRoom session={session} isJoinAvailable={showMeetingControls} />
        <SessionTimeline execution={execution.data} />
        <LiveAttendanceIndicator execution={execution.data} />

        {showMeetingControls && (
          <div className="flex flex-col sm:flex-row gap-sm">
            <JoinSessionButton
              session={session}
              execution={execution.data}
              isGuide={isGuide}
              start={execution.start}
              join={execution.join}
            />
            {execution.data?.meetingUrl && (
              <Button asChild variant="outline" size="md" className="w-full sm:w-auto">
                <a href={execution.data.meetingUrl} target="_blank" rel="noopener noreferrer">
                  Open Room
                </a>
              </Button>
            )}
          </div>
        )}

        {isEndedOrCompleted && (
          <div className="flex items-center gap-2 rounded-md border border-success/25 bg-success/10 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <p className="text-body-sm font-semibold text-foreground">
              This session has ended. Meeting access is closed.
            </p>
          </div>
        )}

        {!hasSessionTimeArrived && session.status === 'booked' && (
          <div className="rounded-md border border-border bg-muted/20 px-4 py-3">
            <p className="text-body-sm font-semibold text-foreground">Meeting not open yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Join controls will appear automatically at the scheduled time.
            </p>
          </div>
        )}

        {showMeetingControls && (
          <>
            {attachErrorToast(execution.start)}
            {attachErrorToast(execution.join)}
            {attachErrorToast(execution.end)}
            {attachErrorToast(execution.complete)}
          </>
        )}

        {showMeetingControls && (
          <SessionCompletionGate
            execution={execution.data}
            isGuide={isGuide}
            end={execution.end}
            complete={execution.complete}
          />
          )}
      </CardContent>
    </Card>
  );
};
