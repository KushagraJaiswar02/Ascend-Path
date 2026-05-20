import { sessionRepository } from './session.repository';
import { userRepository } from '../users/user.repository';
import { Role } from '../users/user.model';
import { SessionStatus } from './session.model';
import { CreateSessionInput, UpdateSessionInput, RateSessionInput } from './session.validation';
import { respectService } from '../respect/respect.service';
import { RespectReason } from '../respect/respectVote.model';
import { fameService } from '../users/fame.service';
import { notificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.model';
import { logger } from '../../utils/logger';

export const sessionService = {
  async createSession(userId: string, data: CreateSessionInput) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    if (user.role !== Role.GUIDE) {
      throw new Error('Only Guides can create availability sessions');
    }

    return await sessionRepository.createSession({
      ...data,
      scheduledAt: new Date(data.scheduledAt),
      guideId: userId as any,
      status: SessionStatus.OPEN,
    });
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
    if (!session) throw new Error('Session not found');

    if (session.guideId._id.toString() === userId) {
      throw new Error('You cannot book your own session');
    }

    if (session.status !== SessionStatus.OPEN) {
      throw new Error('This session is no longer available');
    }

    // Atomic update simulation (in real prod, use atomic findOneAndUpdate with condition)
    const updatedSession = await sessionRepository.updateSession(sessionId, {
      clientId: userId as any,
      status: SessionStatus.BOOKED,
    });

    if (updatedSession) {
      notificationService.createNotification({
        userId: session.guideId._id.toString(),
        type: NotificationType.SESSION_BOOKED,
        message: `Your session has been booked.`,
        link: `/sessions/${updatedSession._id}`
      }).catch((e) => logger.error('Failed to notify guide of booking:', e));
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
    });
  },

  async completeSession(userId: string, sessionId: string) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.guideId._id.toString() !== userId) {
      throw new Error('Only the Guide can mark the session as completed');
    }

    if (session.status !== SessionStatus.BOOKED) {
      throw new Error('Only booked sessions can be marked as completed');
    }

    const updatedSession = await sessionRepository.updateSession(sessionId, {
      status: SessionStatus.COMPLETED,
    });

    // Asynchronous fame update
    fameService.updateFameScore(session.guideId._id.toString()).catch((e) => logger.error('Failed to update fame score after session complete:', e));

    return updatedSession;
  },

  async rateSession(userId: string, sessionId: string, data: RateSessionInput) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.clientId?._id.toString() !== userId) {
      throw new Error('Only the client can rate this session');
    }

    if (session.status !== SessionStatus.COMPLETED) {
      throw new Error('You can only rate a completed session');
    }

    if (session.rating) {
      throw new Error('You have already rated this session');
    }

    const updatedSession = await sessionRepository.updateSession(sessionId, {
      rating: data.rating,
      review: data.review,
    });

    // Hook into respect system
    if (data.rating >= 4) {
      try {
        await respectService.grantOneTimePoints(
          userId,
          session.guideId._id.toString(),
          sessionId,
          RespectReason.SESSION,
          50 // Bonus points for a great mentoring session
        );
      } catch (e) {
        // Ignored if already awarded
      }
    }

    // Update Fame Score
    fameService.updateFameScore(session.guideId._id.toString()).catch(console.error);

    return updatedSession;
  },
};
