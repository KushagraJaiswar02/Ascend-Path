import { subDays } from './dateWindow';
import { userRepository } from '../users/user.repository';
import { Role, User } from '../users/user.model';
import { reportRepository } from '../moderation/report.repository';
import { AuditAction, AuditSeverity } from '../moderation/auditLog.model';
import { Post } from '../posts/post.model';
import { Reply } from '../posts/reply.model';
import { Session, SessionStatus } from '../sessions/session.model';
import { Report, ReportStatus } from '../moderation/report.model';
import { Review } from '../reviews/review.model';
import { CareerRoadmap } from '../roadmaps/roadmap.model';
import { UserProgress } from '../roadmaps/userProgress.model';

const protectedRoles = new Set<Role>([Role.ADMIN, Role.SUPER_ADMIN, Role.ARCHITECT]);

export const adminService = {
  async assignRole(userId: string, role: Role, actorId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    if (!Object.values(Role).includes(role)) {
      throw new Error('Invalid role');
    }

    await userRepository.updateUser(userId, { role });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.ROLE_CHANGE,
      targetId: userId,
      targetType: 'user',
      details: `Changed role from ${user.role} to ${role}`,
      metadata: { previousRole: user.role, nextRole: role },
      severity: AuditSeverity.CRITICAL,
    });

    return { success: true, message: `Role ${role} assigned to user` };
  },

  async verifyGuide(userId: string, actorId: string) {
    const user = await userRepository.updateUser(userId, { role: Role.GUIDE, isVerified: true });
    if (!user) throw new Error('User not found');

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.VERIFY_GUIDE,
      targetId: userId,
      targetType: 'guide_profile',
      details: 'Verified guide profile',
    });

    return { success: true, message: 'Guide verified successfully' };
  },

  async banUser(userId: string, actorId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');
    if (protectedRoles.has(user.role)) throw new Error('Cannot ban protected administrative roles');

    await userRepository.updateUser(userId, { isBanned: true });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.BAN,
      targetId: userId,
      targetType: 'user',
      details: 'Permanently banned user',
      severity: AuditSeverity.CRITICAL,
    });

    return { success: true, message: 'User banned successfully' };
  },

  async unbanUser(userId: string, actorId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    await userRepository.updateUser(userId, { isBanned: false });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.UNBAN,
      targetId: userId,
      targetType: 'user',
      details: 'Unbanned user',
      severity: AuditSeverity.WARNING,
    });

    return { success: true, message: 'User unbanned successfully' };
  },

  async listUsers(page: number, limit: number, search?: string, role?: Role) {
    const skip = (page - 1) * limit;
    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return { users, currentPage: page, totalPages: Math.ceil(total / limit), totalUsers: total };
  },

  async getUserDetail(userId: string) {
    const [user, reportsAgainst, auditHistory] = await Promise.all([
      User.findById(userId).select('-passwordHash'),
      Report.find({ targetId: userId }).sort({ createdAt: -1 }).limit(20),
      reportRepository.listAuditLogs(1, 20, { targetType: 'user' }),
    ]);
    if (!user) throw new Error('User not found');

    return {
      ...user.toObject(),
      reportsAgainst,
      auditHistory: auditHistory.logs.filter((log: any) => log.targetId.toString() === userId),
    };
  },

  async getPlatformStats() {
    const now = new Date();
    const lastDay = subDays(1);
    const lastWeek = subDays(7);
    const lastMonth = subDays(30);

    const [
      totalUsers,
      activeToday,
      activeThisWeek,
      totalGuides,
      verifiedGuides,
      bannedUsers,
      suspendedUsers,
      totalPosts,
      totalSessions,
      pendingReports,
      totalRoadmaps,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ updatedAt: { $gte: lastDay } }),
      User.countDocuments({ updatedAt: { $gte: lastWeek } }),
      User.countDocuments({ role: Role.GUIDE }),
      User.countDocuments({ role: Role.GUIDE, isVerified: true }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ suspendedUntil: { $gt: now } }),
      Post.countDocuments({ moderationStatus: { $ne: 'deleted' } }),
      Session.countDocuments(),
      Report.countDocuments({ status: { $in: [ReportStatus.PENDING, ReportStatus.ASSIGNED] } }),
      CareerRoadmap.countDocuments(),
    ]);

    return {
      totalUsers,
      activeToday,
      activeThisWeek,
      totalGuides,
      verifiedGuides,
      bannedUsers,
      suspendedUsers,
      totalPosts,
      totalSessions,
      pendingReports,
      totalRoadmaps,
      activeRate: totalUsers ? activeToday / totalUsers : 0,
      weeklyActiveRate: totalUsers ? activeThisWeek / totalUsers : 0,
      newUsersLast30Days: await User.countDocuments({ createdAt: { $gte: lastMonth } }),
    };
  },

  async getAnalyticsOverview() {
    const [growth, topMentors, roadmapCompletion, engagementByCategory, abuseSpikes, retention, reviewVolume] =
      await Promise.all([
        User.aggregate([
          { $match: { createdAt: { $gte: subDays(30) } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: '$_id', count: 1 } },
        ]),
        User.find({ role: Role.GUIDE })
          .select('name avatar domains averageRating totalSessions totalReviews fameScore')
          .sort({ fameScore: -1, averageRating: -1 })
          .limit(10),
        UserProgress.aggregate([
          { $match: { completedAt: { $exists: true } } },
          { $group: { _id: '$roadmapId', completions: { $sum: 1 } } },
          { $sort: { completions: -1 } },
          { $limit: 10 },
          { $lookup: { from: 'careerroadmaps', localField: '_id', foreignField: '_id', as: 'roadmap' } },
          { $unwind: '$roadmap' },
          { $project: { _id: 0, roadmapId: '$_id', title: '$roadmap.title', completions: 1 } },
        ]),
        Post.aggregate([
          { $group: { _id: '$category', posts: { $sum: 1 }, upvotes: { $sum: '$upvotes' }, replies: { $sum: 0 } } },
          { $sort: { posts: -1 } },
          { $project: { _id: 0, category: '$_id', posts: 1, upvotes: 1, replies: 1 } },
        ]),
        Report.aggregate([
          { $match: { createdAt: { $gte: subDays(14) } } },
          { $group: { _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, reason: '$reason' }, count: { $sum: 1 } } },
          { $sort: { '_id.date': 1, count: -1 } },
          { $project: { _id: 0, date: '$_id.date', reason: '$_id.reason', count: 1 } },
        ]),
        Promise.all([
          User.countDocuments({ updatedAt: { $gte: subDays(7) } }),
          User.countDocuments({ updatedAt: { $gte: subDays(30) } }),
          User.countDocuments({ updatedAt: { $gte: subDays(90) } }),
          User.countDocuments(),
        ]),
        Review.aggregate([
          { $match: { createdAt: { $gte: subDays(30) } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: '$_id', count: 1 } },
        ]),
      ]);

    return {
      growth,
      topMentors,
      roadmapCompletion,
      engagementByCategory,
      abuseSpikes,
      retention: { last7: retention[0], last30: retention[1], last90: retention[2], total: retention[3] },
      reviewVolume,
      sessionBookingsLast30Days: await Session.countDocuments({
        status: { $in: [SessionStatus.BOOKED, SessionStatus.COMPLETED] },
        createdAt: { $gte: subDays(30) },
      }),
      roadmapEnrollmentsLast30Days: await UserProgress.countDocuments({ startedAt: { $gte: subDays(30) } }),
    };
  },

  async getPlatformHealth() {
    const [users, bannedUsers, suspendedUsers, reports, actionedReports, hiddenContentCount, averageGuideRating] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isBanned: true }),
        User.countDocuments({ suspendedUntil: { $gt: new Date() } }),
        Report.countDocuments(),
        Report.countDocuments({ status: ReportStatus.ACTIONED }),
        Promise.all([
          Post.countDocuments({ moderationStatus: 'hidden' }),
          Reply.countDocuments({ moderationStatus: 'hidden' }),
          Review.countDocuments({ moderationStatus: 'hidden' }),
          CareerRoadmap.countDocuments({ moderationStatus: 'hidden' }),
        ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),
        User.aggregate([{ $match: { role: Role.GUIDE } }, { $group: { _id: null, average: { $avg: '$averageRating' } } }]),
      ]);

    return {
      banRate: users ? bannedUsers / users : 0,
      suspensionRate: users ? suspendedUsers / users : 0,
      averageGuideRating: averageGuideRating[0]?.average || 0,
      reportConversionRate: reports ? actionedReports / reports : 0,
      hiddenContentCount,
    };
  },

  async listAuditLogs(page: number, limit: number, action?: AuditAction, targetType?: string) {
    return await reportRepository.listAuditLogs(page, limit, { action, targetType });
  },
};
