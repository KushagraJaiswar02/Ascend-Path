import mongoose, { Document, Schema } from 'mongoose';

export interface IGrowthCheckIn extends Document {
  userId: mongoose.Types.ObjectId;
  confidenceLevel: number;
  hardestThing?: string;
  goalsChanged?: boolean;
  newGoalText?: string;
  pacingFeeling?: 'too_slow' | 'right' | 'too_fast' | 'overwhelmed';
  supportNeeded: string[];
  createdAt: Date;
  updatedAt: Date;
}

const growthCheckInSchema = new Schema<IGrowthCheckIn>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    confidenceLevel: { type: Number, required: true, min: 1, max: 5 },
    hardestThing: { type: String, trim: true, maxlength: 1200 },
    goalsChanged: { type: Boolean, default: false },
    newGoalText: { type: String, trim: true, maxlength: 1000 },
    pacingFeeling: { type: String, enum: ['too_slow', 'right', 'too_fast', 'overwhelmed'] },
    supportNeeded: { type: [String], default: [] },
  },
  { timestamps: true }
);

growthCheckInSchema.index({ userId: 1, createdAt: -1 });

export const GrowthCheckIn = mongoose.model<IGrowthCheckIn>('GrowthCheckIn', growthCheckInSchema);
