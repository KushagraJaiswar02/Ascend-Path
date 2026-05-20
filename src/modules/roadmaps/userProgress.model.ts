import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  roadmapId: mongoose.Types.ObjectId;
  completedSteps: number[];
  progressPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const userProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'CareerRoadmap', required: true },
    completedSteps: [{ type: Number }], // Array of step indices
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Prevent duplicate progress tracking for the same user and roadmap
userProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', userProgressSchema);
