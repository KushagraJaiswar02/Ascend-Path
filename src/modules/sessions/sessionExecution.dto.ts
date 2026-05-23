import { env } from '../../config/env';
import { AttendanceStatus, ISession, SessionExecutionState, SessionStatus } from './session.model';

const getId = (value: any) => value?._id?.toString?.() || value?.toString?.() || '';

export const calculateVerifiedDurationMinutes = (session: ISession) => {
  const startedAt = session.startedAt?.getTime?.();
  const endedAt = session.endedAt?.getTime?.() || Date.now();
  const mentorJoinedAt = session.mentorJoinedAt?.getTime?.();
  const menteeJoinedAt = session.menteeJoinedAt?.getTime?.();
  const effectiveStart = Math.max(startedAt || 0, mentorJoinedAt || 0, menteeJoinedAt || 0);

  if (!effectiveStart || !endedAt || endedAt <= effectiveStart) return 0;
  return Math.floor((endedAt - effectiveStart) / (1000 * 60));
};

export const hasVerifiedAttendance = (session: ISession) => {
  return Boolean(
    session.status === SessionStatus.COMPLETED &&
      session.attendanceStatus === AttendanceStatus.COMPLETED &&
      session.sessionExecutionState === SessionExecutionState.REFLECTION_UNLOCKED &&
      session.menteeJoinedAt &&
      session.endedAt
  );
};

export const toSessionExecutionDTO = (session: ISession, participantUrl?: string) => {
  const mentorJoined = Boolean(session.mentorJoinedAt);
  const menteeJoined = Boolean(session.menteeJoinedAt);
  const actualDurationMinutes = session.actualDurationMinutes ?? calculateVerifiedDurationMinutes(session);
  const minimumDurationMinutes = env.SESSION_MINIMUM_DURATION_MINUTES;
  const durationGateMet = Boolean(session.menteeJoinedAt);
  const completionAvailable = Boolean(
    session.startedAt &&
      session.endedAt &&
      menteeJoined &&
      session.status !== SessionStatus.COMPLETED
  );

  return {
    sessionId: session._id.toString(),
    guideId: getId(session.guideId),
    clientId: getId(session.clientId),
    meetingProvider: session.meetingProvider,
    meetingUrl: participantUrl || session.meetingUrl,
    meetingRoomId: session.meetingRoomId,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    mentorJoinedAt: session.mentorJoinedAt,
    menteeJoinedAt: session.menteeJoinedAt,
    actualDurationMinutes,
    minimumDurationMinutes,
    attendanceStatus: session.attendanceStatus,
    sessionExecutionState: session.sessionExecutionState,
    participants: {
      mentorJoined,
      menteeJoined,
    },
    gates: {
      bothParticipantsJoined: mentorJoined && menteeJoined,
      durationGateMet,
      completionAvailable,
      reflectionUnlocked: session.sessionExecutionState === SessionExecutionState.REFLECTION_UNLOCKED,
    },
  };
};
