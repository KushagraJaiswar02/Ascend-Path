import mongoose from 'mongoose';
import { CareerDomain } from '../taxonomy/careerDomain.model';
import { CareerGoal } from '../taxonomy/careerGoal.model';
import { CareerRoadmap } from '../roadmaps/roadmap.model';
import { Session, SessionStatus } from '../sessions/session.model';
import { User, Role } from '../users/user.model';
import { UserProgress } from '../roadmaps/userProgress.model';
import { PathwayConnection } from './pathwayConnection.model';

export const pathwayRepository = {
  async upsertConnection(data: any) {
    return await PathwayConnection.findOneAndUpdate(
      {
        sourceDomain: data.sourceDomain,
        targetDomain: data.targetDomain,
        relationshipType: data.relationshipType,
      },
      data,
      { upsert: true, new: true, runValidators: true }
    ).populate('sourceDomain targetDomain suggestedRoadmaps');
  },

  async updateConnection(id: string, data: any) {
    return await PathwayConnection.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('sourceDomain targetDomain suggestedRoadmaps');
  },

  async connectionsForDomain(domainId: string, limit = 12) {
    return await PathwayConnection.find({ sourceDomain: domainId, isActive: true })
      .populate('sourceDomain targetDomain suggestedRoadmaps')
      .sort({ overlapStrength: -1, updatedAt: -1 })
      .limit(limit);
  },

  async incomingConnections(domainId: string, limit = 8) {
    return await PathwayConnection.find({ targetDomain: domainId, isActive: true })
      .populate('sourceDomain targetDomain suggestedRoadmaps')
      .sort({ overlapStrength: -1 })
      .limit(limit);
  },

  async domainBySlug(slug: string) {
    return await CareerDomain.findOne({ slug, isActive: true }).populate('clusterId', 'name slug icon color');
  },

  async goalsForDomain(domainId: string) {
    return await CareerGoal.find({ isActive: true }).sort({ order: 1 }).limit(8);
  },

  async roadmapsForDomain(domainId: string, limit = 8) {
    return await CareerRoadmap.find({
      careerDomains: new mongoose.Types.ObjectId(domainId),
      moderationStatus: { $nin: ['deleted', 'hidden'] },
      $or: [{ isPublished: true, visibility: 'public' }, { isPublic: true }],
    })
      .populate('createdBy', 'name avatar role')
      .sort({ enrollmentCount: -1, averageRating: -1 })
      .limit(limit);
  },

  async sessionsForDomain(domainId: string, limit = 6) {
    return await Session.find({
      careerDomains: new mongoose.Types.ObjectId(domainId),
      status: { $in: [SessionStatus.SCHEDULED, SessionStatus.REGISTRATION_OPEN, SessionStatus.OPEN, SessionStatus.LIVE] },
      scheduledAt: { $gt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    })
      .populate('guideId', 'name avatar role fameScore')
      .sort({ scheduledAt: 1, attendeeCount: -1 })
      .limit(limit);
  },

  async mentorsForDomain(domainId: string, limit = 6) {
    return await User.find({
      careerDomains: new mongoose.Types.ObjectId(domainId),
      $or: [{ role: Role.GUIDE }, { roles: Role.GUIDE }, { capabilities: 'discover:listed' }],
      mentorProfileStatus: 'approved',
      profileVisibility: true,
      isBanned: false,
    })
      .select('-passwordHash')
      .sort({ fameScore: -1, averageRating: -1 })
      .limit(limit);
  },

  async activeUserProgress(userId: string) {
    return await UserProgress.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('roadmapId', 'title slug careerDomains nextRoadmaps recommendedSequence difficulty pathType')
      .sort({ lastActiveAt: -1 })
      .limit(5);
  },

  async roadmapsByIds(ids: any[]) {
    return await CareerRoadmap.find({ _id: { $in: ids } }).select('title slug difficulty careerDomains pathType estimatedWeeks');
  },
};
