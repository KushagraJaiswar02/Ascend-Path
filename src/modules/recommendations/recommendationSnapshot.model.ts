import mongoose, { Document, Schema } from 'mongoose';

export type RecommendationTarget = 'mentor' | 'roadmap' | 'session' | 'forum' | 'resource' | 'career_path';

export interface IRecommendationSnapshotItem {
  targetType: RecommendationTarget;
  targetId: mongoose.Types.ObjectId;
  score: number;
  reasons: string[];
  contextLabel?: string;
  item?: Record<string, any>;
}

export interface IRecommendationSnapshot extends Document {
  userId: mongoose.Types.ObjectId;
  context: string;
  items: IRecommendationSnapshotItem[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const recommendationSnapshotSchema = new Schema<IRecommendationSnapshot>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    context: { type: String, required: true, trim: true, index: true },
    items: [
      {
        targetType: { type: String, enum: ['mentor', 'roadmap', 'session', 'forum', 'resource', 'career_path'], required: true },
        targetId: { type: Schema.Types.ObjectId, required: true },
        score: { type: Number, required: true },
        reasons: { type: [String], default: [] },
        contextLabel: { type: String },
        item: { type: Schema.Types.Mixed },
        _id: false,
      },
    ],
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

recommendationSnapshotSchema.index({ userId: 1, context: 1, expiresAt: 1 });

export const RecommendationSnapshot = mongoose.model<IRecommendationSnapshot>('RecommendationSnapshot', recommendationSnapshotSchema);
