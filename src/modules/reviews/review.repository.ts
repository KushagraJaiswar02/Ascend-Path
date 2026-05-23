import { Review, IReview } from './review.model';
import mongoose from 'mongoose';

export const reviewRepository = {
  async createReview(data: Partial<IReview>): Promise<IReview> {
    const review = new Review(data);
    return await review.save();
  },

  async findReviewById(id: string): Promise<IReview | null> {
    return await Review.findById(id).populate('reviewerId', 'name avatar respectPoints');
  },

  async findReviewBySessionId(sessionId: string): Promise<IReview | null> {
    return await Review.findOne({ sessionId });
  },

  async updateReview(id: string, updateData: Partial<IReview>): Promise<IReview | null> {
    return await Review.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  async deleteReview(id: string): Promise<void> {
    await Review.findByIdAndDelete(id);
  },

  /**
   * Fetches paginated, active reviews for a Guide.
   */
  async getPublicReviewsForGuide(guideId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      guideId: new mongoose.Types.ObjectId(guideId),
      moderationStatus: 'approved',
    })
      .populate('reviewerId', 'name avatar respectPoints')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({
      guideId: new mongoose.Types.ObjectId(guideId),
      moderationStatus: 'approved',
    });

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Highly optimized aggregation pipeline to compile ratings stats, star distributions, and trait tags.
   */
  async getGuideRatingBreakdown(guideId: string) {
    const objectId = new mongoose.Types.ObjectId(guideId);

    const result = await Review.aggregate([
      { $match: { guideId: objectId, moderationStatus: 'approved' } },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
              },
            },
          ],
          stars: [
            {
              $group: {
                _id: '$rating',
                count: { $sum: 1 },
              },
            },
          ],
          tags: [
            { $unwind: '$tags' },
            {
              $group: {
                _id: '$tags',
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],
        },
      },
    ]);

    const facetData = result[0];
    const stats = facetData.stats[0] || { averageRating: 0, totalReviews: 0 };
    
    // Fill up empty star values (1 to 5) so the frontend gets complete sets
    const starDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    facetData.stars.forEach((item: any) => {
      const ratingKey = item._id as 1 | 2 | 3 | 4 | 5;
      if (starDistribution[ratingKey] !== undefined) {
        starDistribution[ratingKey] = item.count;
      }
    });

    const tagsDistribution = facetData.tags.map((item: any) => ({
      tag: item._id,
      count: item.count,
    }));

    return {
      averageRating: Math.round(stats.averageRating * 100) / 100,
      totalReviews: stats.totalReviews,
      starDistribution,
      tagsDistribution,
    };
  },
};
