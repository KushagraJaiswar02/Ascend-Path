import { User, Role, GuideRank } from '../users/user.model';
import { Session, SessionStatus } from '../sessions/session.model';
import { CareerRoadmap } from '../roadmaps/roadmap.model';
import { Post } from '../posts/post.model';
import { Reply } from '../posts/reply.model';
import { Review } from '../reviews/review.model';
import { ReputationAuditLog } from './reputationAudit.model';
import mongoose from 'mongoose';
import { logger } from '../../utils/logger';

export const reputationService = {
  /**
   * Recalculates and updates the fame score of a Guide using a multi-factor weighted equation.
   * Performs anti-abuse loops (reciprocal boosting) and logs auditable events.
   */
  async recalculateFameScore(guideId: string): Promise<number> {
    const user = await User.findById(guideId);
    if (!user || user.role !== Role.GUIDE) {
      return 0;
    }

    const objectId = new mongoose.Types.ObjectId(guideId);
    const oldFameScore = user.fameScore || 0;

    // ─── FACTOR 1: Verified Reviews Average (40% Weight) ─────────────────────
    const reviews = await Review.find({
      guideId: objectId,
      moderationStatus: 'approved',
    });
    
    let avgRating = 0;
    let totalReviews = reviews.length;
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = sum / totalReviews;
    }
    const ratingScore = (avgRating / 5.0) * 40;

    // ─── FACTOR 2: Completed Sessions Volume (20% Weight) ────────────────────
    const completedSessions = await Session.countDocuments({
      guideId: objectId,
      status: SessionStatus.COMPLETED,
    });
    const sessionScore = Math.min((completedSessions / 50) * 20, 20);

    // ─── FACTOR 3: Active Roadmaps Followers (15% Weight) ────────────────────
    const roadmaps = await CareerRoadmap.find({ createdBy: objectId });
    const totalFollowers = roadmaps.reduce((acc, r) => acc + (r.followerCount || 0), 0);
    const followerScore = Math.min((totalFollowers / 100) * 15, 15);

    // ─── FACTOR 4: Forum Contribution Respect Points (15% Weight) ─────────────
    const respectPoints = user.respectPoints || 0;
    const forumScore = Math.min((respectPoints / 100) * 15, 15);

    // ─── FACTOR 5: Recent Engagement & Consistency (10% Weight) ──────────────
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [recentSession, recentPost, recentReply] = await Promise.all([
      Session.findOne({
        guideId: objectId,
        status: SessionStatus.COMPLETED,
        scheduledAt: { $gte: thirtyDaysAgo },
      }),
      Post.findOne({
        authorId: objectId,
        createdAt: { $gte: thirtyDaysAgo },
      }),
      Reply.findOne({
        authorId: objectId,
        createdAt: { $gte: thirtyDaysAgo },
      }),
    ]);
    const isConsistent = !!(recentSession || recentPost || recentReply);
    const consistencyScore = isConsistent ? 10 : 0;

    // ─── FACTOR 6: Reciprocal Boosting Check (Anti-Abuse Penalty) ─────────────
    let boostingPenalty = 0;
    // Find all users who left a review for this guide
    const reviewerIds = reviews.map((r) => r.reviewerId.toString());
    const uniqueReviewers = Array.from(new Set(reviewerIds));

    // Scans for mutual booking loops
    for (const reviewerId of uniqueReviewers) {
      // Find reviews left *by* this Guide *for* that reviewer (if they swapped roles)
      const mutualReviews = await Review.countDocuments({
        reviewerId: objectId,
        guideId: new mongoose.Types.ObjectId(reviewerId),
      });

      if (mutualReviews > 1) {
        boostingPenalty += 25; // Apply a heavy flat penalty for reciprocal loops
        logger.warn(
          `[ANTI-ABUSE] Reciprocal reviews detected between Guide ${guideId} and Reviewer ${reviewerId}. Applying penalty.`
        );
      }
    }

    // ─── COMPUTE FINAL SCORE ──────────────────────────────────────────────────
    const rawFameScore = ratingScore + sessionScore + followerScore + forumScore + consistencyScore - boostingPenalty;
    const fameScore = Math.min(Math.max(Math.round(rawFameScore), 0), 100);

    // Determine Guide Rank
    let guideRank = GuideRank.RISING;
    if (fameScore >= 70) {
      guideRank = GuideRank.EXPERT;
    } else if (fameScore >= 30) {
      guideRank = GuideRank.ESTABLISHED;
    }

    // Update User Document
    const roundedAvgRating = Math.round(avgRating * 100) / 100;
    await User.findByIdAndUpdate(guideId, {
      fameScore,
      guideRank: guideRank as any,
      averageRating: roundedAvgRating,
      totalReviews,
      totalSessions: completedSessions,
    });

    // ─── LOG REPUTATION AUDIT ────────────────────────────────────────────────
    if (fameScore !== oldFameScore) {
      const delta = fameScore - oldFameScore;
      let reason = 'Recomputed fame score based on updated stats.';
      if (boostingPenalty > 0) {
        reason += ` Applied flat penalty of -${boostingPenalty} due to reciprocal boosting flags.`;
      }

      await ReputationAuditLog.create({
        userId: objectId,
        type: 'fame',
        action: boostingPenalty > 0 ? 'review_reported' : 'review_received',
        oldValue: oldFameScore,
        newValue: fameScore,
        delta,
        reason,
      }).catch((e) => logger.error('Failed to create reputation audit log:', e));
    }

    return fameScore;
  },
};
