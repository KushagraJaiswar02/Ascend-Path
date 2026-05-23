import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  reviewerId: mongoose.Types.ObjectId;
  guideId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  rating: number;
  reviewText: string;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  isVerified: boolean;
  moderationStatus: 'approved' | 'flagged' | 'hidden';
  flagReason?: string;
  reportedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    guideId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true, minlength: 10, maxlength: 2000, trim: true },
    tags: { type: [String], default: [] },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], required: true },
    isVerified: { type: Boolean, default: true },
    moderationStatus: {
      type: String,
      enum: ['approved', 'flagged', 'hidden'],
      default: 'approved',
    },
    flagReason: { type: String },
    reportedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// High-performance indexes
reviewSchema.index({ sessionId: 1 }, { unique: true }); // Strictly 1 review per study session
reviewSchema.index({ guideId: 1, moderationStatus: 1 }); // For paginating guide reviews
reviewSchema.index({ reviewerId: 1 }); // For finding reviews left by a student
reviewSchema.index({ rating: 1 }); // For filtering reviews by rating

export const Review = mongoose.model<IReview>('Review', reviewSchema);
