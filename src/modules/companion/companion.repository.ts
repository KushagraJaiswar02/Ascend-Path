import mongoose from 'mongoose';
import { CareerCompanionProfile } from './careerCompanionProfile.model';
import { GrowthTimelineEvent } from './growthTimelineEvent.model';
import { CareerJournalEntry } from './careerJournalEntry.model';
import { GrowthCheckIn } from './growthCheckIn.model';
import { UserProgress } from '../roadmaps/userProgress.model';
import { Session } from '../sessions/session.model';
import { SessionReflection } from '../sessions/sessionReflection.model';

export const companionRepository = {
  async getProfile(userId: string) {
    return await CareerCompanionProfile.findOne({ userId });
  },

  async upsertProfile(userId: string, data: any) {
    return await CareerCompanionProfile.findOneAndUpdate(
      { userId },
      { ...data, userId: new mongoose.Types.ObjectId(userId), lastAnalyzedAt: new Date() },
      { upsert: true, new: true, runValidators: true }
    );
  },

  async addTimelineEvent(data: any) {
    return await GrowthTimelineEvent.create(data);
  },

  async getTimeline(userId: string, limit = 30) {
    return await GrowthTimelineEvent.find({ userId }).sort({ occurredAt: -1 }).limit(limit);
  },

  async createJournalEntry(data: any) {
    return await CareerJournalEntry.create(data);
  },

  async getJournal(userId: string, limit = 20) {
    return await CareerJournalEntry.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  },

  async createCheckIn(data: any) {
    return await GrowthCheckIn.create(data);
  },

  async getCheckIns(userId: string, limit = 10) {
    return await GrowthCheckIn.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  },

  async getProgress(userId: string) {
    return await UserProgress.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('roadmapId', 'title slug careerDomains difficulty pathType')
      .sort({ lastActiveAt: -1 });
  },

  async getSessions(userId: string) {
    return await Session.find({
      $or: [{ clientId: userId }, { 'attendees.userId': userId }],
    }).sort({ scheduledAt: -1 }).limit(30);
  },

  async getReflections(userId: string) {
    return await SessionReflection.find({ menteeId: new mongoose.Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .limit(30);
  },

  async analytics() {
    const [momentum, blockers] = await Promise.all([
      CareerCompanionProfile.aggregate([
        { $group: { _id: '$momentum.status', count: { $sum: 1 }, avgScore: { $avg: '$momentum.score' } } },
      ]),
      CareerCompanionProfile.aggregate([
        { $unwind: '$blockers' },
        { $match: { 'blockers.resolvedAt': { $exists: false } } },
        { $group: { _id: '$blockers.type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);
    return { momentum, blockers };
  },
};
