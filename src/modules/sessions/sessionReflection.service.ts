import { eventEmitter } from '../../utils/eventEmitter';
import { logger } from '../../utils/logger';
import mongoose from 'mongoose';
import { sessionRepository } from './session.repository';
import { SessionStatus, SessionType } from './session.model';
import { SessionReflectionEvent } from './sessionReflection.events';
import { sessionReflectionRepository } from './sessionReflection.repository';
import { SessionReflectionStatus } from './sessionReflection.model';
import { SubmitMentorFollowupInput, SubmitSessionReflectionInput } from './sessionReflection.validation';
import { toSessionReflectionDTO } from './sessionReflection.dto';
import { hasVerifiedAttendance } from './sessionExecution.dto';

const getId = (value: any) => value?._id?.toString?.() || value?.toString?.() || '';

export const sessionReflectionService = {
  async requestReflectionForCompletedSession(sessionId: string) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.sessionType !== SessionType.PRIVATE_MENTORSHIP) {
      throw new Error('Reflections are only available for private mentorship sessions');
    }
    if (session.status !== SessionStatus.COMPLETED || !hasVerifiedAttendance(session)) {
      throw new Error('Reflection can only be requested for verified completed sessions');
    }

    const menteeId = getId(session.clientId);
    const mentorId = getId(session.guideId);
    if (!menteeId || !mentorId) {
      throw new Error('Completed session is missing participant data');
    }

    const reflection = await sessionReflectionRepository.createRequestedReflection({
      sessionId,
      menteeId,
      mentorId,
    });

    eventEmitter.emit(SessionReflectionEvent.SESSION_REFLECTION_REQUESTED, {
      sessionId,
      reflectionId: reflection._id.toString(),
      menteeId,
      mentorId,
      title: session.topic || session.title || 'Mentorship session',
    });

    return toSessionReflectionDTO(reflection);
  },

  async submitMenteeReflection(userId: string, sessionId: string, data: SubmitSessionReflectionInput) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.sessionType !== SessionType.PRIVATE_MENTORSHIP) {
      throw new Error('Reflections are only available for private mentorship sessions');
    }
    if (session.status !== SessionStatus.COMPLETED || !hasVerifiedAttendance(session)) {
      throw new Error('Reflections are available after verified session completion');
    }

    const menteeId = getId(session.clientId);
    const mentorId = getId(session.guideId);
    if (menteeId !== userId) {
      throw new Error('Only the mentee can submit this reflection');
    }

    const existing = await sessionReflectionRepository.createRequestedReflection({ sessionId, menteeId, mentorId });
    const reflection = await sessionReflectionRepository.updateMenteeReflection(sessionId, {
      menteeReflection: {
        learnings: data.learnings,
        confidenceLevel: data.confidenceLevel,
        nextChallenge: data.nextChallenge,
        submittedAt: new Date(),
      },
      status: existing?.mentorFollowup?.submittedAt
        ? SessionReflectionStatus.COMPLETED
        : SessionReflectionStatus.MENTEE_SUBMITTED,
    });
    if (!reflection) throw new Error('Reflection not found');

    eventEmitter.emit(SessionReflectionEvent.SESSION_REFLECTION_SUBMITTED, {
      sessionId,
      reflectionId: reflection._id.toString(),
      menteeId,
      mentorId,
      title: session.topic || session.title || 'Mentorship session',
      confidenceLevel: data.confidenceLevel,
    });

    return toSessionReflectionDTO(reflection);
  },

  async submitMentorFollowup(userId: string, sessionId: string, data: SubmitMentorFollowupInput) {
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.sessionType !== SessionType.PRIVATE_MENTORSHIP) {
      throw new Error('Follow-up recommendations are only available for private mentorship sessions');
    }
    if (session.status !== SessionStatus.COMPLETED || !hasVerifiedAttendance(session)) {
      throw new Error('Follow-up recommendations are available after verified completion');
    }

    const menteeId = getId(session.clientId);
    const mentorId = getId(session.guideId);
    if (mentorId !== userId) {
      throw new Error('Only the mentor can add follow-up recommendations');
    }

    await sessionReflectionRepository.createRequestedReflection({ sessionId, menteeId, mentorId });
    const hasActionableFollowup = Boolean(
      data.mentorNotes ||
        data.nextSessionSuggestion ||
        data.recommendedRoadmapSteps?.length ||
        data.recommendedResources?.length ||
        data.recommendedProjects?.length
    );
    if (!hasActionableFollowup) {
      throw new Error('Add at least one recommendation, note, project, or next-session suggestion');
    }

    const existing = await sessionReflectionRepository.getBySessionId(sessionId);
    const reflection = await sessionReflectionRepository.updateMentorFollowup(sessionId, {
      mentorFollowup: {
        recommendedRoadmapSteps: (data.recommendedRoadmapSteps || []).map((step) => ({
          ...step,
          roadmapId: step.roadmapId ? new mongoose.Types.ObjectId(step.roadmapId) : undefined,
          stepId: step.stepId ? new mongoose.Types.ObjectId(step.stepId) : undefined,
        })),
        recommendedResources: data.recommendedResources || [],
        recommendedProjects: data.recommendedProjects || [],
        mentorNotes: data.mentorNotes,
        nextSessionSuggestion: data.nextSessionSuggestion,
        submittedAt: new Date(),
      },
      status: existing?.menteeReflection?.submittedAt
        ? SessionReflectionStatus.COMPLETED
        : SessionReflectionStatus.FOLLOWUP_ADDED,
    });
    if (!reflection) throw new Error('Reflection not found');

    eventEmitter.emit(SessionReflectionEvent.MENTOR_FOLLOWUP_ADDED, {
      sessionId,
      reflectionId: reflection._id.toString(),
      menteeId,
      mentorId,
      title: session.topic || session.title || 'Mentorship session',
      recommendationCount:
        (data.recommendedRoadmapSteps?.length || 0) +
        (data.recommendedResources?.length || 0) +
        (data.recommendedProjects?.length || 0),
    });

    return toSessionReflectionDTO(reflection);
  },

  async getReflectionForSession(userId: string, sessionId: string) {
    const reflection = await sessionReflectionRepository.getBySessionId(sessionId);
    if (!reflection) return null;

    const menteeId = getId((reflection as any).menteeId);
    const mentorId = getId((reflection as any).mentorId);
    if (userId !== menteeId && userId !== mentorId) {
      throw new Error('You are not authorized to view this reflection');
    }

    return toSessionReflectionDTO(reflection);
  },

  async getMyReflections(userId: string, limit: number) {
    const reflections = await sessionReflectionRepository.getForUser(userId, limit);
    return reflections.map(toSessionReflectionDTO);
  },

  async getAnalytics() {
    try {
      return await sessionReflectionRepository.getReflectionAnalytics();
    } catch (error) {
      logger.error('Failed to calculate session reflection analytics:', error);
      return {
        total: 0,
        requested: 0,
        menteeSubmitted: 0,
        followupAdded: 0,
        completed: 0,
        reflectionCompletionRate: 0,
        mentorFollowupRate: 0,
      };
    }
  },
};
