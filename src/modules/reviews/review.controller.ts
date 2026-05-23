import { Request, Response, NextFunction } from 'express';
import { reviewService } from './review.service';
import { reviewRepository } from './review.repository';
import { createReviewSchema, updateReviewSchema, reportReviewSchema } from './review.validation';

export const reviewController = {
  /**
   * POST /api/v1/reviews
   * Submits a verified mentorship review.
   */
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const validated = createReviewSchema.parse({ body: req.body });
      
      const review = await reviewService.submitReview(userId, validated.body);
      
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/reviews/:id
   * Updates an existing review (Enforces 15-minute lock).
   */
  async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const reviewId = req.params.id as string;
      const validated = updateReviewSchema.parse({ body: req.body });

      const review = await reviewService.editReview(userId, reviewId, validated.body);

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/reviews/:id
   * Deletes a review.
   */
  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const reviewId = req.params.id as string;

      await reviewService.removeReview(userId, reviewId);

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/reviews/:id/report
   * Flags a review for moderation.
   */
  async reportReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const reviewId = req.params.id as string;
      const validated = reportReviewSchema.parse({ body: req.body });

      const review = await reviewService.reportReview(userId, reviewId, validated.body.reason);

      res.status(200).json({
        success: true,
        message: 'Review successfully reported for moderation',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/guides/:id/reviews
   * Fetches paginated reviews and aggregated rating breakdowns for a Guide.
   */
  async getGuideReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const guideId = req.params.id as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;

      const [reviewsResult, breakdown] = await Promise.all([
        reviewRepository.getPublicReviewsForGuide(guideId, page, limit),
        reviewRepository.getGuideRatingBreakdown(guideId),
      ]);

      res.status(200).json({
        success: true,
        data: {
          ...reviewsResult,
          breakdown,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
