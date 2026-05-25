import mongoose from 'mongoose';
import { userRepository } from '../users/user.repository';
import { eventEmitter } from '../../utils/eventEmitter';
import { notificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.model';
import { companionRepository } from './companion.repository';
import { adaptiveGuidanceFor, toCompanionProfileDto } from './companion.dto';
import { CreateJournalEntryInput, SubmitGrowthCheckInInput } from './companion.validation';

const struggleKeywords = ['stuck', 'confused', 'hard', 'difficult', 'blocked', 'overwhelmed', 'unclear', 'lost'];
const uncertaintyKeywords = ['not sure', 'unsure', 'confused', 'doubt', 'maybe', 'uncertain'];
const interestKeywords = ['interested', 'enjoyed', 'curious', 'liked', 'want to learn'];

const includesAny = (text: string, keywords: string[]) => keywords.some((keyword) => text.toLowerCase().includes(keyword));

export const careerCompanionService = {
  async getOrBuildProfile(userId: string) {
    const existing = await companionRepository.getProfile(userId);
    if (existing && existing.lastAnalyzedAt && Date.now() - existing.lastAnalyzedAt.getTime() < 10 * 60 * 1000) {
      return existing;
    }
    return await this.recomputeProfile(userId);
  },

  async recomputeProfile(userId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const [progress, sessions, reflections, checkIns, journal] = await Promise.all([
      companionRepository.getProgress(userId),
      companionRepository.getSessions(userId),
      companionRepository.getReflections(userId),
      companionRepository.getCheckIns(userId),
      companionRepository.getJournal(userId, 20),
    ]);

    const confidenceSamples = [
      ...reflections
        .filter((item) => item.menteeReflection?.confidenceLevel)
        .map((item) => ({ value: item.menteeReflection!.confidenceLevel, source: 'session_reflection', capturedAt: item.menteeReflection!.submittedAt || item.updatedAt })),
      ...checkIns.map((item) => ({ value: item.confidenceLevel, source: 'growth_check_in', capturedAt: item.createdAt })),
    ].sort((a, b) => a.capturedAt.getTime() - b.capturedAt.getTime()).slice(-12);

    const currentConfidence = confidenceSamples.at(-1)?.value;
    const previousConfidence = confidenceSamples.at(-2)?.value;
    const confidenceDirection = !currentConfidence || !previousConfidence
      ? 'unknown'
      : currentConfidence > previousConfidence
        ? 'rising'
        : currentConfidence < previousConfidence
          ? 'falling'
          : 'steady';

    const lastActiveAt = progress[0]?.lastActiveAt || sessions[0]?.scheduledAt || journal[0]?.createdAt;
    const daysInactive = lastActiveAt ? (Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24) : 999;
    const completedSteps = progress.reduce((sum, item) => sum + (item.completedSteps?.length || 0), 0);
    const completedRoadmaps = progress.filter((item) => item.completedAt).length;
    const streakCount = Math.max(0, ...progress.map((item) => item.streakCount || 0));
    const consistencyScore = Math.max(0, Math.min(100, completedSteps * 4 + streakCount * 3 - Math.max(0, daysInactive - 7) * 3));
    const momentumScore = Math.max(0, Math.min(100, consistencyScore + completedRoadmaps * 15 + sessions.length * 2));
    const momentumStatus = daysInactive > 21
      ? 'stalled'
      : daysInactive > 10
        ? 'recovering'
        : momentumScore > 65
          ? 'building'
          : momentumScore > 30
            ? 'steady'
            : 'unknown';

    const blockers = this.detectBlockers(progress, sessions, reflections, checkIns);
    const interpreted = this.interpretReflections(reflections, checkIns, journal);
    const milestones = [
      ...(user.onboardingCompleted ? [{ title: 'Completed onboarding', category: 'onboarding', occurredAt: user.updatedAt }] : []),
      ...progress.filter((item) => item.completedAt).map((item: any) => ({
        title: `Completed ${item.roadmapId?.title || 'a roadmap'}`,
        category: 'roadmap_completed',
        entityId: item.roadmapId?._id,
        occurredAt: item.completedAt,
      })),
    ].slice(-20);

    return await companionRepository.upsertProfile(userId, {
      aspirations: [user.onboarding?.targetRole].filter(Boolean),
      activeGoals: user.careerGoals || user.onboarding?.careerGoals || [],
      evolvingInterests: interpreted.recurringInterests,
      confidenceTrend: {
        current: currentConfidence,
        previous: previousConfidence,
        direction: confidenceDirection,
        samples: confidenceSamples,
      },
      learningPatterns: {
        preferredPace: this.paceFromCommitment(user.weeklyCommitment || user.onboarding?.weeklyCommitment),
        consistencyScore,
        lastActiveAt,
      },
      momentum: {
        score: momentumScore,
        status: momentumStatus,
        streakCount,
        lastMomentumAt: lastActiveAt,
      },
      blockers,
      milestones,
      reflectionSummaries: interpreted,
      mentorshipHistory: this.mentorshipHistory(sessions),
    });
  },

  paceFromCommitment(commitment?: string) {
    if (commitment === '0_3_hours') return 'light';
    if (commitment === '16_plus_hours') return 'intensive';
    if (commitment) return 'steady';
    return undefined;
  },

  detectBlockers(progress: any[], sessions: any[], reflections: any[], checkIns: any[]) {
    const blockers: any[] = [];
    const abandoned = progress.filter((item) => item.progressPercentage < 40 && Date.now() - new Date(item.lastActiveAt).getTime() > 21 * 24 * 60 * 60 * 1000);
    if (abandoned.length) {
      blockers.push({
        type: 'abandoned_roadmap',
        label: 'A roadmap may be losing momentum',
        severity: abandoned.length > 1 ? 'high' : 'medium',
        detectedAt: new Date(),
        evidence: abandoned.slice(0, 3).map((item: any) => item.roadmapId?.title || 'Inactive roadmap'),
      });
    }

    const lowConfidence = checkIns.filter((item) => item.confidenceLevel <= 2).length + reflections.filter((item) => (item.menteeReflection?.confidenceLevel || 5) <= 2).length;
    if (lowConfidence >= 2) {
      blockers.push({
        type: 'low_confidence',
        label: 'Confidence has been low across recent reflections',
        severity: 'medium',
        detectedAt: new Date(),
        evidence: [`${lowConfidence} low-confidence signals`],
      });
    }

    const noShows = sessions.filter((item) => item.attendanceStatus === 'missed').length;
    if (noShows >= 2) {
      blockers.push({
        type: 'session_no_show',
        label: 'Mentorship sessions may need rescheduling support',
        severity: 'medium',
        detectedAt: new Date(),
        evidence: [`${noShows} missed sessions`],
      });
    }

    const struggleTexts = [
      ...reflections.map((item) => item.menteeReflection?.nextChallenge || ''),
      ...checkIns.map((item) => item.hardestThing || ''),
    ].filter(Boolean);
    const repeatedStruggles = struggleTexts.filter((text) => includesAny(text, struggleKeywords));
    if (repeatedStruggles.length >= 2) {
      blockers.push({
        type: 'repeated_topic_struggle',
        label: 'Repeated struggle themes are appearing',
        severity: 'medium',
        detectedAt: new Date(),
        evidence: repeatedStruggles.slice(0, 3),
      });
    }

    return blockers;
  },

  interpretReflections(reflections: any[], checkIns: any[], journal: any[]) {
    const texts = [
      ...reflections.flatMap((item) => [item.menteeReflection?.learnings, item.menteeReflection?.nextChallenge, item.mentorFollowup?.mentorNotes]),
      ...checkIns.flatMap((item) => [item.hardestThing, item.newGoalText]),
      ...journal.flatMap((item) => [item.title, item.body, ...(item.tags || [])]),
    ].filter(Boolean).map(String);

    return {
      recurringInterests: [...new Set(texts.filter((text) => includesAny(text, interestKeywords)).flatMap((text) => this.extractKeywords(text)))].slice(0, 10),
      recurringStruggles: [...new Set(texts.filter((text) => includesAny(text, struggleKeywords)).flatMap((text) => this.extractKeywords(text)))].slice(0, 10),
      evolvingGoals: [...new Set(checkIns.filter((item) => item.goalsChanged && item.newGoalText).map((item) => item.newGoalText))].slice(0, 8),
      uncertaintyThemes: [...new Set(texts.filter((text) => includesAny(text, uncertaintyKeywords)).flatMap((text) => this.extractKeywords(text)))].slice(0, 8),
    };
  },

  extractKeywords(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 4 && !['about', 'because', 'learning', 'really', 'still'].includes(word))
      .slice(0, 6);
  },

  mentorshipHistory(sessions: any[]) {
    const map = new Map<string, any>();
    sessions.forEach((session) => {
      const mentorId = session.guideId?.toString?.();
      if (!mentorId) return;
      const existing = map.get(mentorId) || { mentorId, sessionCount: 0, lastSessionAt: session.scheduledAt };
      existing.sessionCount += 1;
      if (new Date(session.scheduledAt) > new Date(existing.lastSessionAt)) existing.lastSessionAt = session.scheduledAt;
      map.set(mentorId, existing);
    });
    return [...map.values()].map((item) => ({ ...item, mentorId: new mongoose.Types.ObjectId(item.mentorId) }));
  },

  async getCompanionHome(userId: string) {
    const [profile, timeline, journal, checkIns] = await Promise.all([
      this.getOrBuildProfile(userId),
      companionRepository.getTimeline(userId, 20),
      companionRepository.getJournal(userId, 6),
      companionRepository.getCheckIns(userId, 5),
    ]);
    return {
      profile: toCompanionProfileDto(profile),
      adaptiveGuidance: adaptiveGuidanceFor(profile),
      timeline,
      journal,
      checkIns,
    };
  },

  async submitCheckIn(userId: string, input: SubmitGrowthCheckInInput) {
    const checkIn = await companionRepository.createCheckIn({ ...input, userId: new mongoose.Types.ObjectId(userId) });
    await companionRepository.addTimelineEvent({
      userId,
      type: 'check_in',
      title: 'Completed a growth check-in',
      summary: input.hardestThing || 'Updated confidence and support needs.',
      visibility: 'private',
      metadata: { confidenceLevel: input.confidenceLevel, supportNeeded: input.supportNeeded },
    });
    const profile = await this.recomputeProfile(userId);
    return { checkIn, profile: toCompanionProfileDto(profile), adaptiveGuidance: adaptiveGuidanceFor(profile) };
  },

  async createJournalEntry(userId: string, input: CreateJournalEntryInput) {
    const entry = await companionRepository.createJournalEntry({
      ...input,
      userId: new mongoose.Types.ObjectId(userId),
      relatedDomainIds: input.relatedDomainIds.map((id) => new mongoose.Types.ObjectId(id)),
    });
    await companionRepository.addTimelineEvent({
      userId,
      type: 'journal_entry',
      title: entry.title,
      summary: entry.entryType,
      visibility: 'private',
      entityId: entry._id,
      entityType: 'CareerJournalEntry',
    });
    await this.recomputeProfile(userId);
    return entry;
  },

  async recordTimelineEvent(userId: string, input: any) {
    const event = await companionRepository.addTimelineEvent({ ...input, userId });
    await this.recomputeProfile(userId).catch(() => undefined);
    return event;
  },

  async mentorSummary(mentorId: string, learnerId: string) {
    const sessions = await companionRepository.getSessions(learnerId);
    const hasMentoredLearner = sessions.some((session) => session.guideId?.toString?.() === mentorId);
    if (!hasMentoredLearner) throw { statusCode: 403, message: 'Mentor summary is only available for your learners' };

    const profile = await this.getOrBuildProfile(learnerId);
    if (!profile.privacy.shareProgressSummaryWithMentors) {
      return { shared: false, message: 'Learner has disabled mentor progress summaries.' };
    }

    return {
      shared: true,
      momentum: profile.momentum,
      confidenceTrend: profile.confidenceTrend,
      blockers: profile.privacy.shareBlockerSignalsWithMentors ? profile.blockers : [],
      reflectionSummaries: profile.reflectionSummaries,
      milestones: profile.milestones.slice(-8),
    };
  },

  async analytics() {
    return await companionRepository.analytics();
  },
};

eventEmitter.on('ROADMAP_COMPLETED', (payload: any) => {
  careerCompanionService.recordTimelineEvent(payload.userId, {
    type: 'roadmap_completed',
    title: `Completed ${payload.title}`,
    entityId: payload.roadmapId,
    entityType: 'Roadmap',
    visibility: 'mentor_summary',
  }).catch(() => undefined);
});

eventEmitter.on('ROADMAP_STEP_COMPLETED', (payload: any) => {
  careerCompanionService.recordTimelineEvent(payload.userId, {
    type: 'roadmap_step_completed',
    title: `Completed ${payload.stepTitle}`,
    entityId: payload.stepId,
    entityType: 'RoadmapStep',
    visibility: 'private',
    metadata: { roadmapId: payload.roadmapId, progressPercentage: payload.progressPercentage },
  }).catch(() => undefined);
});

eventEmitter.on('SESSION_COMPLETED', (payload: any) => {
  careerCompanionService.recordTimelineEvent(payload.clientId, {
    type: 'session_completed',
    title: `Completed mentorship session`,
    summary: payload.title,
    entityId: payload.sessionId,
    entityType: 'Session',
    visibility: 'mentor_summary',
  }).catch(() => undefined);
});

eventEmitter.on('SESSION_REFLECTION_SUBMITTED', async (payload: any) => {
  await careerCompanionService.recordTimelineEvent(payload.menteeId, {
    type: 'reflection_submitted',
    title: 'Submitted a session reflection',
    summary: `Confidence ${payload.confidenceLevel}/5`,
    entityId: payload.reflectionId,
    entityType: 'SessionReflection',
    visibility: 'private',
    metadata: { confidenceLevel: payload.confidenceLevel },
  }).catch(() => undefined);
});
