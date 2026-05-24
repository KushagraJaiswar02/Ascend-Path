import mongoose from 'mongoose';
import { CareerRoadmap } from './roadmap.model';
import { UserProgress } from './userProgress.model';

const DEFAULT_ACTIVE_WINDOW_DAYS = Number(process.env.ROADMAP_ACTIVE_WINDOW_DAYS || 14);
const DEFAULT_TRENDING_WINDOW_DAYS = Number(process.env.ROADMAP_TRENDING_WINDOW_DAYS || 7);
const DEFAULT_PREVIOUS_WINDOW_DAYS = Number(process.env.ROADMAP_PREVIOUS_WINDOW_DAYS || 7);

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const hiddenModerationStatuses: Array<'deleted' | 'hidden'> = ['deleted', 'hidden'];

const publicRoadmapQuery = {
  visibility: 'public' as const,
  isPublished: true,
  moderationStatus: { $nin: hiddenModerationStatuses },
};

const getPublicRoadmapOrThrow = async (roadmapId: string) => {
  if (!mongoose.Types.ObjectId.isValid(roadmapId)) {
    throw { statusCode: 404, message: 'Roadmap not found' };
  }

  const roadmap = await CareerRoadmap.findOne({ _id: roadmapId, ...publicRoadmapQuery }).select('_id');
  if (!roadmap) {
    throw { statusCode: 404, message: 'Roadmap not found' };
  }

  return roadmap._id;
};

const publicLearnerLookupStages = [
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'learner',
      pipeline: [
        {
          $match: {
            profileVisibility: { $ne: false },
            showRoadmapActivity: { $ne: false },
            isBanned: { $ne: true },
          },
        },
        {
          $project: {
            name: {
              $cond: [{ $eq: ['$anonymousRoadmapParticipation', true] }, 'Anonymous learner', '$name'],
            },
            avatar: {
              $cond: [{ $eq: ['$anonymousRoadmapParticipation', true] }, null, '$avatar'],
            },
            role: 1,
            anonymousRoadmapParticipation: 1,
          },
        },
      ],
    },
  },
  { $unwind: '$learner' },
];

const toMomentum = (current: number, previous: number) => {
  if (current === 0 && previous === 0) return { direction: 'steady', percentage: 0 };
  if (previous === 0) return { direction: 'up', percentage: 100 };
  const percentage = Math.round(((current - previous) / previous) * 100);
  return {
    direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'steady',
    percentage: Math.abs(percentage),
  };
};

export const roadmapCommunityService = {
  async getRoadmapCommunity(roadmapId: string, options?: { avatarLimit?: number }) {
    const activeSince = daysAgo(DEFAULT_ACTIVE_WINDOW_DAYS);
    const weekStart = daysAgo(DEFAULT_TRENDING_WINDOW_DAYS);
    const previousStart = daysAgo(DEFAULT_TRENDING_WINDOW_DAYS + DEFAULT_PREVIOUS_WINDOW_DAYS);
    const avatarLimit = Math.min(options?.avatarLimit || 8, 24);

    const roadmapObjectId = await getPublicRoadmapOrThrow(roadmapId);

    const [
      enrollmentCount,
      activeLearnerCount,
      completionCount,
      completionsThisWeek,
      currentGrowth,
      previousGrowth,
      activeLearners,
    ] = await Promise.all([
      UserProgress.countDocuments({ roadmapId: roadmapObjectId }),
      UserProgress.countDocuments({ roadmapId: roadmapObjectId, completedAt: { $exists: false }, lastActiveAt: { $gte: activeSince } }),
      UserProgress.countDocuments({ roadmapId: roadmapObjectId, completedAt: { $exists: true } }),
      UserProgress.countDocuments({ roadmapId: roadmapObjectId, completedAt: { $gte: weekStart } }),
      UserProgress.countDocuments({ roadmapId: roadmapObjectId, startedAt: { $gte: weekStart } }),
      UserProgress.countDocuments({ roadmapId: roadmapObjectId, startedAt: { $gte: previousStart, $lt: weekStart } }),
      UserProgress.aggregate([
        {
          $match: {
            roadmapId: roadmapObjectId,
            completedAt: { $exists: false },
            lastActiveAt: { $gte: activeSince },
          },
        },
        { $sort: { lastActiveAt: -1 } },
        ...publicLearnerLookupStages,
        { $limit: avatarLimit },
        {
          $project: {
            _id: 0,
            userId: '$userId',
            name: '$learner.name',
            avatar: '$learner.avatar',
            role: '$learner.role',
            progressPercentage: 1,
            lastActiveAt: 1,
            anonymous: '$learner.anonymousRoadmapParticipation',
          },
        },
      ]),
    ]);

    return {
      roadmapId,
      activeWindowDays: DEFAULT_ACTIVE_WINDOW_DAYS,
      enrollmentCount,
      activeLearnerCount,
      completionCount,
      completionsThisWeek,
      weeklyParticipationGrowth: currentGrowth,
      previousWeeklyParticipationGrowth: previousGrowth,
      momentum: toMomentum(currentGrowth, previousGrowth),
      activeLearners,
      signals: {
        activeLearnerLabel: `${activeLearnerCount} learners currently progressing`,
        completionLabel: `${completionsThisWeek} completed this roadmap this week`,
      },
    };
  },

  async getActiveLearners(roadmapId: string, page = 1, limit = 20) {
    const activeSince = daysAgo(DEFAULT_ACTIVE_WINDOW_DAYS);
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const skip = (Math.max(page, 1) - 1) * safeLimit;
    const roadmapObjectId = await getPublicRoadmapOrThrow(roadmapId);

    const [learners, total] = await Promise.all([
      UserProgress.aggregate([
        {
          $match: {
            roadmapId: roadmapObjectId,
            completedAt: { $exists: false },
            lastActiveAt: { $gte: activeSince },
          },
        },
        { $sort: { lastActiveAt: -1 } },
        ...publicLearnerLookupStages,
        { $skip: skip },
        { $limit: safeLimit },
        {
          $project: {
            _id: 0,
            userId: '$userId',
            name: '$learner.name',
            avatar: '$learner.avatar',
            progressPercentage: 1,
            lastActiveAt: 1,
            anonymous: '$learner.anonymousRoadmapParticipation',
          },
        },
      ]),
      UserProgress.countDocuments({ roadmapId: roadmapObjectId, completedAt: { $exists: false }, lastActiveAt: { $gte: activeSince } }),
    ]);

    return {
      learners,
      currentPage: page,
      totalPages: Math.ceil(total / safeLimit),
      totalLearners: total,
    };
  },

  async getTrendingRoadmaps(limit = 6) {
    const weekStart = daysAgo(DEFAULT_TRENDING_WINDOW_DAYS);
    const previousStart = daysAgo(DEFAULT_TRENDING_WINDOW_DAYS + DEFAULT_PREVIOUS_WINDOW_DAYS);
    const safeLimit = Math.min(Math.max(limit, 1), 20);

    return await UserProgress.aggregate([
      {
        $match: {
          startedAt: { $gte: previousStart },
        },
      },
      {
        $group: {
          _id: '$roadmapId',
          currentGrowth: {
            $sum: { $cond: [{ $gte: ['$startedAt', weekStart] }, 1, 0] },
          },
          previousGrowth: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$startedAt', previousStart] }, { $lt: ['$startedAt', weekStart] }] },
                1,
                0,
              ],
            },
          },
          activeLearners: {
            $sum: { $cond: [{ $gte: ['$lastActiveAt', daysAgo(DEFAULT_ACTIVE_WINDOW_DAYS)] }, 1, 0] },
          },
          completionsThisWeek: {
            $sum: { $cond: [{ $gte: ['$completedAt', weekStart] }, 1, 0] },
          },
        },
      },
      { $match: { $or: [{ currentGrowth: { $gt: 0 } }, { activeLearners: { $gt: 0 } }] } },
      {
        $addFields: {
          momentumScore: {
            $add: [
              { $multiply: ['$currentGrowth', 3] },
              { $multiply: ['$activeLearners', 1] },
              { $multiply: ['$completionsThisWeek', 2] },
            ],
          },
        },
      },
      { $sort: { momentumScore: -1, currentGrowth: -1, activeLearners: -1 } },
      { $limit: safeLimit },
      {
        $lookup: {
          from: 'careerroadmaps',
          localField: '_id',
          foreignField: '_id',
          as: 'roadmap',
          pipeline: [
            { $match: publicRoadmapQuery },
            { $project: { title: 1, slug: 1, domains: 1, difficulty: 1, enrollmentCount: 1, thumbnail: 1 } },
          ],
        },
      },
      { $unwind: '$roadmap' },
      {
        $project: {
          _id: 0,
          roadmapId: '$_id',
          roadmap: 1,
          currentGrowth: 1,
          previousGrowth: 1,
          activeLearners: 1,
          completionsThisWeek: 1,
          momentumScore: 1,
        },
      },
    ]);
  },

  async getDashboardMomentumForUser(userId: string) {
    const progress = await UserProgress.find({ userId, completedAt: { $exists: false } })
      .select('roadmapId progressPercentage lastActiveAt')
      .sort({ lastActiveAt: -1 })
      .limit(3);

    const communities = await Promise.all(
      progress.map(async (item) => {
        const roadmap = await CareerRoadmap.findOne({ _id: item.roadmapId, ...publicRoadmapQuery }).select('title slug');
        if (!roadmap) return null;

        const community = await this.getRoadmapCommunity(item.roadmapId.toString(), { avatarLimit: 5 });
        return {
          roadmap,
          progressPercentage: item.progressPercentage,
          lastActiveAt: item.lastActiveAt,
          community,
        };
      })
    );

    return communities.filter((item) => item?.roadmap);
  },
};
