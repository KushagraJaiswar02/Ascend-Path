import { eventEmitter } from '../../utils/eventEmitter';
import { logger } from '../../utils/logger';
import { fameService } from '../users/fame.service';
import { userRepository } from '../users/user.repository';
import { sessionReflectionService } from './sessionReflection.service';
import { calculateVerifiedDurationMinutes, toSessionExecutionDTO } from './sessionExecution.dto';
import { sessionMeetingProviderService } from './sessionMeetingProvider.service';
import { sessionRepository } from './session.repository';
import {
  AttendanceStatus,
  ISession,
  MeetingProvider,
  SessionExecutionState,
  SessionStatus,
} from './session.model';

const getId = (value: any) => value?._id?.toString?.() || value?.toString?.() || '';

const createHttpError = (statusCode: number, message: string) => ({ statusCode, message });

const assertSessionTimeArrived = (session: ISession) => {
  if (Date.now() < new Date(session.scheduledAt).getTime()) {
    throw createHttpError(400, 'The meeting room opens at the scheduled session time');
  }
};

const requireParticipant = (session: ISession, userId: string) => {
  const actorId = getId(userId);
  const guideId = getId(session.guideId);
  const clientId = getId(session.clientId);
  if (actorId !== guideId && actorId !== clientId) {
    throw createHttpError(403, 'You are not authorized to access this session execution');
  }

  return {
    actorId,
    guideId,
    clientId,
    role: actorId === guideId ? 'mentor' : 'mentee',
  };
};

const buildParticipantUrl = async (session: ISession, userId: string) => {
  if (!session.meetingUrl) return undefined;
  const user = await userRepository.findUserById(userId);
  const provider = sessionMeetingProviderService.getProvider(session.meetingProvider || MeetingProvider.JITSI);
  return provider.getParticipantUrl({
    meetingUrl: session.meetingUrl,
    displayName: user?.name || 'AscendPath participant',
  });
};

export const sessionExecutionService = {
  async startSession(userId: string, sessionId: string) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw createHttpError(404, 'Session not found');

    const { actorId, guideId, clientId } = requireParticipant(session, userId);
    if (actorId !== guideId) {
      throw createHttpError(403, 'Only the mentor can start the session room');
    }
    if (session.status !== SessionStatus.BOOKED) {
      throw createHttpError(400, 'Only booked sessions can be started');
    }
    if (!clientId) {
      throw createHttpError(400, 'Cannot start a session without a booked mentee');
    }
    assertSessionTimeArrived(session);

    const provider = sessionMeetingProviderService.getProvider(session.meetingProvider || MeetingProvider.JITSI);
    const meeting = session.meetingUrl && session.meetingRoomId
      ? {
          provider: session.meetingProvider || MeetingProvider.JITSI,
          roomId: session.meetingRoomId,
          url: session.meetingUrl,
        }
      : provider.createRoom({ sessionId, topic: session.topic || session.title });

    const updatedSession = await sessionRepository.updateSession(sessionId, {
      meetingProvider: meeting.provider,
      meetingRoomId: meeting.roomId,
      meetingUrl: meeting.url,
      meetingLink: meeting.url,
      startedAt: session.startedAt || new Date(),
      attendanceStatus: AttendanceStatus.WAITING,
      sessionExecutionState: SessionExecutionState.STARTED,
    });
    if (!updatedSession) throw createHttpError(500, 'Failed to start session');

    eventEmitter.emit('SESSION_STARTED', {
      sessionId,
      clientId,
      guideId,
      title: updatedSession.topic || updatedSession.title || 'Mentorship session',
      startedAt: updatedSession.startedAt,
    });

    return toSessionExecutionDTO(updatedSession, await buildParticipantUrl(updatedSession, actorId));
  },

  async joinSession(userId: string, sessionId: string) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw createHttpError(404, 'Session not found');

    const { actorId, guideId, clientId, role } = requireParticipant(session, userId);
    if (session.status !== SessionStatus.BOOKED) {
      throw createHttpError(400, 'Only booked sessions can be joined');
    }
    assertSessionTimeArrived(session);
    if (!session.meetingUrl || !session.meetingRoomId || !session.startedAt) {
      throw createHttpError(400, 'The mentor has not started this session yet');
    }

    const updateData: Partial<ISession> = {};
    if (role === 'mentor' && !session.mentorJoinedAt) updateData.mentorJoinedAt = new Date();
    if (role === 'mentee' && !session.menteeJoinedAt) updateData.menteeJoinedAt = new Date();

    const mentorJoined = Boolean(updateData.mentorJoinedAt || session.mentorJoinedAt);
    const menteeJoined = Boolean(updateData.menteeJoinedAt || session.menteeJoinedAt);

    updateData.attendanceStatus = mentorJoined && menteeJoined ? AttendanceStatus.ACTIVE : AttendanceStatus.WAITING;
    updateData.sessionExecutionState = mentorJoined && menteeJoined
      ? SessionExecutionState.ACTIVE
      : SessionExecutionState.PARTICIPANTS_JOINED;

    const updatedSession = await sessionRepository.updateSession(sessionId, updateData);
    if (!updatedSession) throw createHttpError(500, 'Failed to join session');

    eventEmitter.emit('PARTICIPANT_JOINED', {
      sessionId,
      clientId,
      guideId,
      participantId: actorId,
      participantRole: role,
      mentorJoinedAt: updatedSession.mentorJoinedAt,
      menteeJoinedAt: updatedSession.menteeJoinedAt,
      attendanceStatus: updatedSession.attendanceStatus,
    });

    return toSessionExecutionDTO(updatedSession, await buildParticipantUrl(updatedSession, actorId));
  },

  async endSession(userId: string, sessionId: string) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw createHttpError(404, 'Session not found');

    const { actorId, guideId, clientId } = requireParticipant(session, userId);
    if (actorId !== guideId) {
      throw createHttpError(403, 'Only the mentor can end the session and unlock reflections');
    }
    if (!session.startedAt) throw createHttpError(400, 'Session has not started');
    if (session.status !== SessionStatus.BOOKED) throw createHttpError(400, 'Only active booked sessions can be ended');
    if (!session.menteeJoinedAt) {
      throw createHttpError(400, 'Reflection unlock requires the mentee to join the session first');
    }

    const endedAt = session.endedAt || new Date();
    const actualDurationMinutes = calculateVerifiedDurationMinutes({ ...session.toObject(), endedAt } as ISession);

    const updatedSession = await sessionRepository.updateSession(sessionId, {
      endedAt,
      actualDurationMinutes,
      status: SessionStatus.COMPLETED,
      attendanceStatus: AttendanceStatus.COMPLETED,
      sessionExecutionState: SessionExecutionState.REFLECTION_UNLOCKED,
    });
    if (!updatedSession) throw createHttpError(500, 'Failed to end session');

    fameService
      .updateFameScore(guideId)
      .catch((e) => logger.error('Failed to update fame score after session end:', e));

    sessionReflectionService
      .requestReflectionForCompletedSession(updatedSession._id.toString())
      .catch((e) => logger.error('Failed to unlock post-session reflection:', e));

    eventEmitter.emit('SESSION_ENDED', {
      sessionId,
      clientId,
      guideId,
      endedAt,
      actualDurationMinutes,
      attendanceStatus: updatedSession.attendanceStatus,
    });

    eventEmitter.emit('SESSION_COMPLETED', {
      sessionId: updatedSession._id.toString(),
      clientId,
      guideId,
      title: updatedSession.topic || updatedSession.title || 'Mentorship Session',
      guideName: 'Your guide',
      actualDurationMinutes,
      attendanceVerified: true,
    });

    return toSessionExecutionDTO(updatedSession, await buildParticipantUrl(updatedSession, actorId));
  },

  async completeSession(userId: string, sessionId: string) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw createHttpError(404, 'Session not found');

    const { actorId, guideId, clientId } = requireParticipant(session, userId);
    if (actorId !== guideId) {
      throw createHttpError(403, 'Only the mentor can finalize verified completion');
    }
    if (session.status === SessionStatus.COMPLETED) {
      return toSessionExecutionDTO(session, await buildParticipantUrl(session, actorId));
    }
    if (session.status !== SessionStatus.BOOKED) {
      throw createHttpError(400, 'Only booked sessions can be completed');
    }
    if (!session.endedAt) {
      throw createHttpError(400, 'End the session before completing attendance verification');
    }
    if (!session.menteeJoinedAt) {
      throw createHttpError(400, 'The mentee must join before reflection unlock is available');
    }

    const actualDurationMinutes = session.actualDurationMinutes ?? calculateVerifiedDurationMinutes(session);

    const updatedSession = await sessionRepository.updateSession(sessionId, {
      status: SessionStatus.COMPLETED,
      attendanceStatus: AttendanceStatus.COMPLETED,
      sessionExecutionState: SessionExecutionState.REFLECTION_UNLOCKED,
      actualDurationMinutes,
    });
    if (!updatedSession) throw createHttpError(500, 'Failed to complete session');

    fameService
      .updateFameScore(guideId)
      .catch((e) => logger.error('Failed to update fame score after verified session completion:', e));

    sessionReflectionService
      .requestReflectionForCompletedSession(updatedSession._id.toString())
      .catch((e) => logger.error('Failed to unlock post-session reflection:', e));

    const [guide] = await Promise.all([
      userRepository.findUserById(guideId),
      userRepository.findUserById(clientId),
    ]);

    eventEmitter.emit('SESSION_COMPLETED', {
      sessionId: updatedSession._id.toString(),
      clientId,
      guideId,
      title: updatedSession.topic || updatedSession.title || 'Mentorship Session',
      guideName: guide?.name || 'Your guide',
      actualDurationMinutes,
      attendanceVerified: true,
    });

    return toSessionExecutionDTO(updatedSession, await buildParticipantUrl(updatedSession, actorId));
  },

  async getExecution(userId: string, sessionId: string) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw createHttpError(404, 'Session not found');
    const { actorId } = requireParticipant(session, userId);
    return toSessionExecutionDTO(session, await buildParticipantUrl(session, actorId));
  },
};
