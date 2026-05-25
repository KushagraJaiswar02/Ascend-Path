import mongoose, { Document, Schema } from 'mongoose';

export type VerifiedAchievementType = 'certificate' | 'badge';

export type VerifiedAchievementCategory =
  | 'roadmap_completion'
  | 'workshop_participation'
  | 'mentorship_milestone'
  | 'learning_streak'
  | 'specialization';

export interface IVerifiedAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  type: VerifiedAchievementType;
  category: VerifiedAchievementCategory;
  title: string;
  description: string;
  issuedAt: Date;
  metadata?: Record<string, any>;
  credentialId: string; // Unique verification hash
  createdAt: Date;
  updatedAt: Date;
}

const verifiedAchievementSchema = new Schema<IVerifiedAchievement>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['certificate', 'badge'], required: true },
    category: {
      type: String,
      enum: ['roadmap_completion', 'workshop_participation', 'mentorship_milestone', 'learning_streak', 'specialization'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    issuedAt: { type: Date, default: Date.now, index: true },
    metadata: { type: Schema.Types.Mixed },
    credentialId: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

verifiedAchievementSchema.index({ userId: 1, type: 1 });

export const VerifiedAchievement = mongoose.model<IVerifiedAchievement>('VerifiedAchievement', verifiedAchievementSchema);
