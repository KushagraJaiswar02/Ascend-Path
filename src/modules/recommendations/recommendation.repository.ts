import mongoose from 'mongoose';
import { User, Role } from '../users/user.model';
import { CareerRoadmap } from '../roadmaps/roadmap.model';
import { Session, SessionStatus, SessionType } from '../sessions/session.model';
import { Post, PostCategory } from '../posts/post.model';
import { UserProgress } from '../roadmaps/userProgress.model';
import { RecommendationProfile } from './recommendationProfile.model';
import { RecommendationSnapshot } from './recommendationSnapshot.model';
import { RecommendationInteraction } from './recommendationInteraction.model';

export const recommendationRepository = {
  async findProfile(userId: string) {
    return await RecommendationProfile.findOne({ userId });
  },

  async upsertProfile(userId: string, data: any) {
    return await RecommendationProfile.findOneAndUpdate(
      { userId },
      { ...data, userId: new mongoose.Types.ObjectId(userId), lastComputedAt: new Date() },
      { upsert: true, new: true, runValidators: true }
    );
  },

  async findSnapshot(userId: string, context: string) {
    return await RecommendationSnapshot.findOne({
      userId,
      context,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  },

  async saveSnapshot(userId: string, context: string, items: any[], ttlMinutes = 30) {
    await RecommendationSnapshot.deleteMany({ userId, context });
    return await RecommendationSnapshot.create({
      userId: new mongoose.Types.ObjectId(userId),
      context,
      items,
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
    });
  },

  async createInteraction(data: any) {
    return await RecommendationInteraction.create(data);
  },

  async interactionCounts(userId: string) {
    return await RecommendationInteraction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$interactionType', count: { $sum: 1 } } },
    ]);
  },

  async activeProgress(userId: string) {
    return await UserProgress.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('roadmapId', 'careerDomains careerGoals domains title difficulty pathType')
      .sort({ lastActiveAt: -1 })
      .limit(10);
  },

  async candidateMentors(domainIds: mongoose.Types.ObjectId[], limit = 40) {
    const query: any = {
      $and: [
        {
          $or: [
            { role: Role.GUIDE },
            { roles: Role.GUIDE },
            { capabilities: 'discover:listed' },
          ],
        },
      ],
      mentorProfileStatus: 'approved',
      profileVisibility: true,
      isBanned: false,
    };
    if (domainIds.length) {
      query.$and.push({
        $or: [
          { careerDomains: { $in: domainIds } },
          { domains: { $exists: true, $ne: [] } },
        ],
      });
    }
    return await User.find(query)
      .select('-passwordHash')
      .sort({ fameScore: -1, averageRating: -1, totalSessions: -1 })
      .limit(limit);
  },

  async candidateRoadmaps(domainIds: mongoose.Types.ObjectId[], goalIds: mongoose.Types.ObjectId[], limit = 50) {
    const query: any = {
      moderationStatus: { $nin: ['deleted', 'hidden'] },
      $or: [{ isPublished: true, visibility: 'public' }, { isPublic: true }],
    };
    const contextual: any[] = [];
    if (domainIds.length) contextual.push({ careerDomains: { $in: domainIds } });
    if (goalIds.length) contextual.push({ careerGoals: { $in: goalIds } });
    if (contextual.length) query.$and = [{ $or: contextual }];
    return await CareerRoadmap.find(query)
      .populate('createdBy', 'name role avatar fameScore')
      .sort({ averageRating: -1, enrollmentCount: -1, updatedAt: -1 })
      .limit(limit);
  },

  async candidateSessions(domainIds: mongoose.Types.ObjectId[], goalIds: mongoose.Types.ObjectId[], limit = 40) {
    const query: any = {
      sessionType: SessionType.PUBLIC_WORKSHOP,
      isPublic: true,
      status: { $in: [SessionStatus.SCHEDULED, SessionStatus.REGISTRATION_OPEN, SessionStatus.LIVE, SessionStatus.OPEN] },
      scheduledAt: { $gt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    };
    const contextual: any[] = [];
    if (domainIds.length) contextual.push({ careerDomains: { $in: domainIds } });
    if (goalIds.length) contextual.push({ careerGoals: { $in: goalIds } });
    if (contextual.length) query.$and = [{ $or: contextual }];
    return await Session.find(query)
      .populate('guideId', 'name role avatar fameScore averageRating careerDomains mentorProfile')
      .sort({ scheduledAt: 1, attendeeCount: -1 })
      .limit(limit);
  },

  async candidatePosts(tags: string[], limit = 40) {
    const query: any = {
      moderationStatus: 'visible',
      category: { $in: [PostCategory.CAREER, PostCategory.SKILLS, PostCategory.EDUCATION, PostCategory.GENERAL] },
    };
    if (tags.length) {
      query.$or = tags.map((tag) => ({ tags: { $regex: new RegExp(tag, 'i') } }));
    }
    return await Post.find(query)
      .populate('authorId', 'name role avatar respectPoints')
      .sort({ isPinned: -1, upvotes: -1, viewCount: -1, createdAt: -1 })
      .limit(limit);
  },

  async analytics() {
    const [trendingDomains, interactions] = await Promise.all([
      RecommendationProfile.aggregate([
        { $unwind: '$careerDomains' },
        { $group: { _id: '$careerDomains', learners: { $sum: 1 } } },
        { $sort: { learners: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'careerdomains', localField: '_id', foreignField: '_id', as: 'domain' } },
        { $unwind: '$domain' },
        { $project: { domainId: '$_id', name: '$domain.name', slug: '$domain.slug', learners: 1, _id: 0 } },
      ]),
      RecommendationInteraction.aggregate([
        { $group: { _id: { targetType: '$targetType', interactionType: '$interactionType' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return { trendingDomains, interactions };
  },
};
