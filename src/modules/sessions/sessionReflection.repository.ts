import { SessionReflection, ISessionReflection, SessionReflectionStatus } from './sessionReflection.model';

export const sessionReflectionRepository = {
  async createRequestedReflection(data: {
    sessionId: string;
    menteeId: string;
    mentorId: string;
  }): Promise<ISessionReflection> {
    return await SessionReflection.findOneAndUpdate(
      { sessionId: data.sessionId },
      {
        $setOnInsert: {
          sessionId: data.sessionId,
          menteeId: data.menteeId,
          mentorId: data.mentorId,
          status: SessionReflectionStatus.REQUESTED,
          requestedAt: new Date(),
        },
      },
      { new: true, upsert: true, runValidators: true }
    );
  },

  async getBySessionId(sessionId: string): Promise<ISessionReflection | null> {
    return await SessionReflection.findOne({ sessionId })
      .populate('sessionId', 'title topic scheduledAt status')
      .populate('menteeId mentorId', 'name avatar role respectPoints fameScore')
      .populate('mentorFollowup.recommendedRoadmapSteps.roadmapId', 'title slug domains difficulty')
      .populate('mentorFollowup.recommendedRoadmapSteps.stepId', 'title type estimatedMinutes difficulty');
  },

  async getForUser(userId: string, limit: number = 20) {
    return await SessionReflection.find({ $or: [{ menteeId: userId }, { mentorId: userId }] })
      .populate('sessionId', 'title topic scheduledAt status')
      .populate('menteeId mentorId', 'name avatar role respectPoints fameScore')
      .populate('mentorFollowup.recommendedRoadmapSteps.roadmapId', 'title slug domains difficulty')
      .populate('mentorFollowup.recommendedRoadmapSteps.stepId', 'title type estimatedMinutes difficulty')
      .sort({ updatedAt: -1 })
      .limit(limit);
  },

  async updateMenteeReflection(sessionId: string, update: Partial<ISessionReflection>) {
    return await SessionReflection.findOneAndUpdate({ sessionId }, update, { new: true, runValidators: true });
  },

  async updateMentorFollowup(sessionId: string, update: Partial<ISessionReflection>) {
    return await SessionReflection.findOneAndUpdate({ sessionId }, update, { new: true, runValidators: true });
  },

  async getReflectionAnalytics() {
    const [total, requested, menteeSubmitted, followupAdded, completed] = await Promise.all([
      SessionReflection.countDocuments(),
      SessionReflection.countDocuments({ status: SessionReflectionStatus.REQUESTED }),
      SessionReflection.countDocuments({ 'menteeReflection.submittedAt': { $exists: true } }),
      SessionReflection.countDocuments({ 'mentorFollowup.submittedAt': { $exists: true } }),
      SessionReflection.countDocuments({ status: SessionReflectionStatus.COMPLETED }),
    ]);

    return {
      total,
      requested,
      menteeSubmitted,
      followupAdded,
      completed,
      reflectionCompletionRate: total ? menteeSubmitted / total : 0,
      mentorFollowupRate: menteeSubmitted ? followupAdded / menteeSubmitted : 0,
    };
  },
};
