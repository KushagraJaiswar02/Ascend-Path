import { sessionRepository } from './session.repository';
import mongoose from 'mongoose';
import { userRepository } from '../users/user.repository';
import { canActAsGuide, hasCapability, UserCapability } from '../users/userCapabilities';
import { AttendanceStatus, RegistrationMode, SessionStatus, SessionType } from './session.model';
import { CreateSessionInput, UpdateSessionInput, RateSessionInput } from './session.validation';
import { respectService } from '../respect/respect.service';
import { RespectReason } from '../respect/respectVote.model';
import { fameService } from '../users/fame.service';
import { eventEmitter } from '../../utils/eventEmitter';
import { logger } from '../../utils/logger';
import { sessionExecutionService } from './sessionExecution.service';
import { taxonomyService } from '../taxonomy/taxonomy.service';

const getId = (value: any) => value?._id?.toString?.() || value?.toString?.() || '';
const createHttpError = (statusCode: number, message: string) => ({ statusCode, message });

export const sessionService = {
  async createSession(userId: string, data: CreateSessionInput) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    if (!canActAsGuide(user) || !hasCapability(user, UserCapability.SESSIONS_HOST) || user.mentorProfileStatus !== 'approved') {
      throw new Error('Only approved mentors can create availability sessions');
    }

    const sessionType = data.sessionType === SessionType.PUBLIC_WORKSHOP
      ? SessionType.PUBLIC_WORKSHOP
      : SessionType.PRIVATE_MENTORSHIP;
    const isPublicWorkshop = sessionType === SessionType.PUBLIC_WORKSHOP;

    const createData: any = {
      ...data,
      careerDomains: data.careerDomains?.length ? await taxonomyService.assertActiveDomains(data.careerDomains) : [],
      careerGoals: data.careerGoals?.length ? await taxonomyService.assertActiveGoals(data.careerGoals) : [],
      scheduledAt: new Date(data.scheduledAt),
      roadmapId: data.roadmapId ? new mongoose.Types.ObjectId(data.roadmapId) as any : undefined,
      guideId: userId as any,
      sessionType,
      isPublic: isPublicWorkshop,
      attendeeCount: 0,
      resources: data.resources || [],
      status: isPublicWorkshop ? SessionStatus.REGISTRATION_OPEN : SessionStatus.OPEN,
      registrationMode: data.registrationMode === RegistrationMode.APPROVAL
        ? RegistrationMode.APPROVAL
        : data.registrationMode === RegistrationMode.INVITE_ONLY
          ? RegistrationMode.INVITE_ONLY
          : RegistrationMode.OPEN,
    };

    return await sessionRepository.createSession(createData);
  },

  async updateSession(userId: string, sessionId: string, data: UpdateSessionInput) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.guideId._id.toString() !== userId) {
      throw new Error('You can only update your own sessions');
    }

    const updateData: any = { ...data };
    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt);
    }
    if (data.careerDomains) {
      updateData.careerDomains = await taxonomyService.assertActiveDomains(data.careerDomains);
    }
    if (data.careerGoals) {
      updateData.careerGoals = await taxonomyService.assertActiveGoals(data.careerGoals);
    }

    return await sessionRepository.updateSession(sessionId, updateData);
  },

  async deleteSession(userId: string, sessionId: string) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.guideId._id.toString() !== userId) {
      throw new Error('You can only delete your own sessions');
    }

    if (session.status === SessionStatus.BOOKED) {
      throw new Error('Cannot delete a booked session. Cancel it instead.');
    }

    await sessionRepository.deleteSession(sessionId);
  },

  async getOpenSessions(page: number, limit: number) {
    return await sessionRepository.getOpenSessions(page, limit);
  },

  async getPublicWorkshops(filters: { domain?: string; difficulty?: string; guideId?: string }, page: number, limit: number) {
    if (filters.domain && !mongoose.Types.ObjectId.isValid(filters.domain)) {
      const resolved = await taxonomyService.resolveDomain(filters.domain);
      if (resolved?.id) filters.domain = resolved.id;
    }
    return await sessionRepository.getPublicWorkshops(filters, page, limit);
  },

  async getUserSessions(userId: string, page: number, limit: number) {
    return await sessionRepository.getUserSessions(userId, page, limit);
  },

  async getSessionById(sessionId: string) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');
    return session;
  },

  async bookSession(userId: string, sessionId: string) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw createHttpError(404, 'Session not found');

    const actorId = getId(userId);
    const guideId = getId(session.guideId);

    if (guideId === actorId) {
      throw createHttpError(400, 'Mentors cannot enroll in their own session');
    }

    if (session.sessionType !== SessionType.PRIVATE_MENTORSHIP) {
      throw createHttpError(400, 'Use workshop registration for public sessions');
    }

    if (session.status !== SessionStatus.OPEN) {
      throw createHttpError(400, 'This session is no longer available');
    }

    // Atomic update simulation (in real prod, use atomic findOneAndUpdate with condition)
    const updatedSession = await sessionRepository.updateSession(sessionId, {
      clientId: actorId as any,
      status: SessionStatus.BOOKED,
    });

    if (updatedSession) {
      Promise.all([
        userRepository.findUserById(actorId),
        userRepository.findUserById(guideId)
      ]).then(([client, guide]) => {
        eventEmitter.emit('SESSION_BOOKED', {
          sessionId: updatedSession._id.toString(),
          clientId: actorId,
          guideId,
          title: session.topic || (session as any).title || 'Mentorship Session',
          clientName: client?.name || 'A learner',
        });
      }).catch((e) => logger.error('Failed to emit SESSION_BOOKED event:', e));
    }

    return updatedSession;
  },

  async registerForPublicSession(userId: string, sessionId: string) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw createHttpError(404, 'Workshop not found');

    const actorId = getId(userId);
    const guideId = getId(session.guideId);

    if (session.sessionType !== SessionType.PUBLIC_WORKSHOP || !session.isPublic) {
      throw createHttpError(400, 'This session is not open for public registration');
    }
    if (![SessionStatus.SCHEDULED, SessionStatus.REGISTRATION_OPEN].includes(session.status)) {
      throw createHttpError(400, 'Registration is not open for this workshop');
    }
    if (guideId === actorId) {
      throw createHttpError(400, 'Hosts are already attached to their workshop');
    }
    if (session.registrationMode !== RegistrationMode.OPEN) {
      throw createHttpError(400, 'This workshop is not using open registration yet');
    }
    if (session.attendees?.some((attendee: any) => getId(attendee.userId) === actorId)) {
      throw createHttpError(400, 'You are already registered for this workshop');
    }
    if (session.capacity && session.attendeeCount >= session.capacity) {
      throw createHttpError(400, 'This workshop is at capacity');
    }

    const updatedSession = await sessionRepository.updateSession(sessionId, {
      attendees: [
        ...(session.attendees || []),
        { userId: actorId as any, registeredAt: new Date() } as any,
      ],
      attendeeCount: (session.attendeeCount || 0) + 1,
    });

    if (updatedSession) {
      eventEmitter.emit('PUBLIC_SESSION_REGISTERED', {
        sessionId: updatedSession._id.toString(),
        userId: actorId,
        guideId,
        attendeeCount: updatedSession.attendeeCount,
        title: updatedSession.title || updatedSession.topic || 'Community workshop',
      });
    }

    return updatedSession;
  },

  async cancelSession(userId: string, sessionId: string) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    const isGuide = session.guideId._id.toString() === userId;
    const isClient = session.clientId?._id.toString() === userId;

    if (!isGuide && !isClient) {
      throw new Error('You are not authorized to cancel this session');
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed session');
    }
    if (session.status === SessionStatus.CANCELLED) {
      throw new Error('Session is already cancelled');
    }

    return await sessionRepository.updateSession(sessionId, {
      status: SessionStatus.CANCELLED,
      attendanceStatus: AttendanceStatus.CANCELLED,
    });
  },

  async completeSession(userId: string, sessionId: string) {
    return await sessionExecutionService.completeSession(userId, sessionId);
  },

  async rateSession(userId: string, sessionId: string, data: RateSessionInput) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw createHttpError(404, 'Session not found');

    const actorId = getId(userId);
    const clientId = getId(session.clientId);
    const guideId = getId(session.guideId);

    if (clientId !== actorId) {
      throw createHttpError(403, 'Only the mentee who attended this session can submit a review');
    }

    if (session.status !== SessionStatus.COMPLETED) {
      throw createHttpError(400, 'You can only rate a completed session');
    }

    if (session.rating) {
      throw createHttpError(400, 'You have already rated this session');
    }

    const updatedSession = await sessionRepository.updateSession(sessionId, {
      rating: data.rating,
      review: data.review,
    });

    // Hook into respect system
    if (data.rating >= 4) {
      try {
        await respectService.grantOneTimePoints(
          actorId,
          guideId,
          sessionId,
          RespectReason.SESSION,
          50 // Bonus points for a great mentoring session
        );
      } catch (e) {
        // Ignored if already awarded
      }
    }

    // Update Fame Score
    fameService.updateFameScore(guideId).catch(console.error);

    return updatedSession;
  },
};
