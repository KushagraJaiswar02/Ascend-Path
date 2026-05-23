import { reviewRepository } from './review.repository';
import { reputationService } from '../reputation/reputation.service';
import { Session, SessionStatus } from '../sessions/session.model';
import { User, Role } from '../users/user.model';
import { CreateReviewInput, UpdateReviewInput, ReportReviewInput } from './review.validation';
import { userRepository } from '../users/user.repository';
import { eventEmitter } from '../../utils/eventEmitter';
import mongoose from 'mongoose';
import { logger } from '../../utils/logger';
import { hasVerifiedAttendance } from '../sessions/sessionExecution.dto';

const getId = (value: any) => value?._id?.toString?.() || value?.toString?.() || '';

export const reviewService = {
  /**
   * Submits a verified study session review. Enforces strict anti-abuse rules.
   */
  async submitReview(userId: string, data: CreateReviewInput) {
    const { sessionId, rating, reviewText, tags } = data;
    const clientObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch referenced study session
    const session = await Session.findById(sessionId);
    if (!session) {
      throw { statusCode: 404, message: 'Mentorship session not found' };
    }

    // 2. Enforce Verification and Attendance checks
    if (session.status !== SessionStatus.COMPLETED || !hasVerifiedAttendance(session)) {
      throw { statusCode: 400, message: 'You can only review sessions with verified attendance and completion' };
    }

    const actorId = getId(userId);
    const clientId = getId(session.clientId);
    const guideId = getId(session.guideId);

    if (!clientId || clientId !== actorId) {
      throw { statusCode: 403, message: 'Only the learner who attended this session can submit a review' };
    }

    // 3. Enforce Single-Review constraint
    if (session.reviewId) {
      throw { statusCode: 400, message: 'You have already submitted a review for this study session' };
    }

    // 4. Enforce Cooldown rate-limit (2-minute cooldown between reviews by the same student)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const recentReview = await mongoose.model('Review').findOne({
      reviewerId: clientObjectId,
      createdAt: { $gte: twoMinutesAgo },
    });
    if (recentReview) {
      throw { statusCode: 429, message: 'Please wait at least 2 minutes between submitting review feedback' };
    }

    // 5. Enforce Anti-Self-Review block
    if (guideId === actorId) {
      throw { statusCode: 400, message: 'Guides cannot submit reviews for themselves' };
    }

    // 6. Calculate simple initial sentiment (for future AI readiness)
    const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';

    // 7. Create Review record
    const review = await reviewRepository.createReview({
      reviewerId: clientObjectId as any,
      guideId: new mongoose.Types.ObjectId(guideId) as any,
      sessionId: new mongoose.Types.ObjectId(sessionId) as any,
      rating,
      reviewText,
      tags: tags || [],
      sentiment,
      isVerified: true,
      moderationStatus: 'approved',
    });

    // 8. Update Session document with review details (backward compatibility)
    await Session.findByIdAndUpdate(sessionId, {
      reviewId: review._id as any,
      rating,
      review: reviewText,
    });

    // 9. Centralized Reputation updates
    await reputationService.recalculateFameScore(guideId);

    // 10. Notify Guide asynchronously by emitting a domain event
    userRepository.findUserById(userId).then((reviewer) => {
      eventEmitter.emit('REVIEW_RECEIVED', {
        reviewId: review._id.toString(),
        reviewerId: userId,
        guideId,
        rating,
        reviewerName: reviewer?.name || 'A student',
      });
    }).catch((e) => logger.error('Failed to emit REVIEW_RECEIVED event:', e));

    return review;
  },

  /**
   * Modifies a review within the strict 15-minute edit window.
   */
  async editReview(userId: string, reviewId: string, data: UpdateReviewInput) {
    const review = await reviewRepository.findReviewById(reviewId);
    if (!review) {
      throw { statusCode: 404, message: 'Review not found' };
    }

    // Enforce authorship
    if (review.reviewerId._id.toString() !== userId) {
      throw { statusCode: 403, message: 'You are not authorized to modify this review' };
    }

    // Enforce 15-minute lock
    const msSinceCreation = Date.now() - review.createdAt.getTime();
    const minutesSinceCreation = msSinceCreation / (1000 * 60);
    if (minutesSinceCreation > 15) {
      throw { statusCode: 400, message: 'Reviews are locked and cannot be edited after the 15-minute window has closed' };
    }

    const updateData: any = {};
    if (data.rating !== undefined) {
      updateData.rating = data.rating;
      updateData.sentiment = data.rating >= 4 ? 'positive' : data.rating === 3 ? 'neutral' : 'negative';
    }
    if (data.reviewText !== undefined) updateData.reviewText = data.reviewText;
    if (data.tags !== undefined) updateData.tags = data.tags;

    const updatedReview = await reviewRepository.updateReview(reviewId, updateData);
    if (!updatedReview) {
      throw { statusCode: 500, message: 'Failed to update review' };
    }

    // Update the embedded review text on the Session model as well
    await Session.findOneAndUpdate(
      { reviewId: new mongoose.Types.ObjectId(reviewId) },
      {
        rating: updatedReview.rating,
        review: updatedReview.reviewText,
      }
    );

    // Dynamic fame score updates
    await reputationService.recalculateFameScore(updatedReview.guideId.toString());

    return updatedReview;
  },

  /**
   * Removes a review and updates associated sessions. Enforces roles.
   */
  async removeReview(userId: string, reviewId: string) {
    const review = await reviewRepository.findReviewById(reviewId);
    if (!review) {
      throw { statusCode: 404, message: 'Review not found' };
    }

    const user = await User.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const isAuthor = review.reviewerId._id.toString() === userId;
    const isAdmin = [Role.SENTINEL, Role.ARCHITECT].includes(user.role);

    if (!isAuthor && !isAdmin) {
      throw { statusCode: 403, message: 'You are not authorized to delete this review' };
    }

    // Delete review
    await reviewRepository.deleteReview(reviewId);

    // Clear session details
    await Session.findOneAndUpdate(
      { reviewId: new mongoose.Types.ObjectId(reviewId) },
      {
        $unset: { reviewId: 1, rating: 1, review: 1 },
      }
    );

    // Sync fame
    await reputationService.recalculateFameScore(review.guideId.toString());
  },

  /**
   * Flags a review for suspicious activity. Escalates to Flagged if reports exceed threshold.
   */
  async reportReview(userId: string, reviewId: string, reason: string) {
    const review = await reviewRepository.findReviewById(reviewId);
    if (!review) {
      throw { statusCode: 404, message: 'Review not found' };
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Check for duplicate reporting
    const alreadyReported = review.reportedBy.some((id) => id.toString() === userId);
    if (alreadyReported) {
      throw { statusCode: 400, message: 'You have already flagged this review' };
    }

    review.reportedBy.push(userObjectId as any);

    // Flag escalation boundary: sets to flagged if reports >= 3
    if (review.reportedBy.length >= 3) {
      review.moderationStatus = 'flagged';
      review.flagReason = `Automated flag escalation: received ${review.reportedBy.length} reports. Latest reason: ${reason}`;
    }

    await review.save();

    // Sync fame in case moderation status changed (hiding/flagging reviews excludes them from Fame calculation)
    await reputationService.recalculateFameScore(review.guideId.toString());

    return review;
  },
};
