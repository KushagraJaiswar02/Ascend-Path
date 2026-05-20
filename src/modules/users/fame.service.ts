import { userRepository } from './user.repository';
import { Role, GuideRank } from './user.model';
import { Session, SessionStatus } from '../sessions/session.model';
import { PingRequest, PingStatus } from '../pings/ping.model';
import { CareerRoadmap } from '../roadmaps/roadmap.model';
import { notificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.model';
import { logger } from '../../utils/logger';

export const fameService = {
  /**
   * Calculates and updates the fame score for a specific guide.
   */
  async updateFameScore(userId: string): Promise<void> {
    const user = await userRepository.findUserById(userId);
    if (!user || user.role !== Role.GUIDE) {
      return; // Only calculate fame for GUIDEs
    }

    const objectId = user._id;

    // 1. Session Rating (Weight: 40%)
    // Normalize to max 40 points (e.g. 5.0 avg = 40 pts)
    const sessionStats = await Session.aggregate([
      { $match: { guideId: objectId, status: SessionStatus.COMPLETED, rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    const avgRating = sessionStats.length > 0 ? sessionStats[0].avgRating : 0;
    const ratingScore = (avgRating / 5.0) * 40;

    // 2. Total Sessions Completed (Weight: 25%)
    // Cap at 50 sessions for max 25 points
    const totalSessions = await Session.countDocuments({ guideId: objectId, status: SessionStatus.COMPLETED });
    const sessionScore = Math.min((totalSessions / 50) * 25, 25);

    // 3. Follower Count from Roadmaps (Weight: 20%)
    // Cap at 100 followers for max 20 points
    const followerStats = await CareerRoadmap.aggregate([
      { $match: { createdBy: objectId } },
      { $group: { _id: null, totalFollowers: { $sum: '$followerCount' } } }
    ]);
    const totalFollowers = followerStats.length > 0 ? followerStats[0].totalFollowers : 0;
    const followerScore = Math.min((totalFollowers / 100) * 20, 20);

    // 4. Ping Response Rate (Weight: 15%)
    // (Answered + Closed) / Total Pings
    const totalPings = await PingRequest.countDocuments({ toUserId: objectId });
    const respondedPings = await PingRequest.countDocuments({
      toUserId: objectId,
      status: { $in: [PingStatus.ANSWERED, PingStatus.CLOSED] }
    });
    
    let responseRateScore = 0;
    if (totalPings > 0) {
      const responseRate = respondedPings / totalPings;
      responseRateScore = responseRate * 15;
    }

    // 5. Final Score Calculation
    const rawFameScore = ratingScore + sessionScore + followerScore + responseRateScore;
    const fameScore = Math.min(Math.max(Math.round(rawFameScore), 0), 100);

    // 6. Determine Rank
    let guideRank = GuideRank.RISING;
    if (fameScore >= 70) {
      guideRank = GuideRank.EXPERT;
    } else if (fameScore >= 30) {
      guideRank = GuideRank.ESTABLISHED;
    }

    // 7. Update User
    await userRepository.updateUser(userId, { fameScore, guideRank: guideRank as any });

    // 8. Notify on rank upgrade
    if (user.guideRank && user.guideRank !== guideRank) {
      // Simplistic check, assumes changing rank is an upgrade or notable change
      notificationService.createNotification({
        userId,
        type: NotificationType.ROLE_UPGRADE,
        message: `Your Guide Rank has been updated to ${guideRank}!`,
        link: `/profile`
      }).catch((e) => logger.error('Failed to send notification:', e));
    }
  }
};
