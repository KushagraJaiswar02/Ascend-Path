import mongoose, { Document, Schema } from 'mongoose';
import { RecommendationTarget } from './recommendationSnapshot.model';

export type RecommendationInteractionType = 'viewed' | 'clicked' | 'ignored' | 'enrolled' | 'booked' | 'completed' | 'saved';

export interface IRecommendationInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  targetType: RecommendationTarget;
  targetId: mongoose.Types.ObjectId;
  interactionType: RecommendationInteractionType;
  context?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const recommendationInteractionSchema = new Schema<IRecommendationInteraction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: ['mentor', 'roadmap', 'session', 'forum', 'resource', 'career_path'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    interactionType: {
      type: String,
      enum: ['viewed', 'clicked', 'ignored', 'enrolled', 'booked', 'completed', 'saved'],
      required: true,
      index: true,
    },
    context: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

recommendationInteractionSchema.index({ userId: 1, targetType: 1, targetId: 1, interactionType: 1, createdAt: -1 });

export const RecommendationInteraction = mongoose.model<IRecommendationInteraction>('RecommendationInteraction', recommendationInteractionSchema);
