import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  roadmapId: mongoose.Types.ObjectId;
  completedSteps: mongoose.Types.ObjectId[]; // Array of RoadmapStep IDs
  progressPercentage: number;
  startedAt: Date;
  lastActiveAt: Date;
  completedAt?: Date;
  streakCount: number;
  notes: Map<string, string>; // stepId -> text note
  bookmarkedSteps: mongoose.Types.ObjectId[]; // Array of RoadmapStep IDs
  createdAt: Date;
  updatedAt: Date;
}

const userProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'CareerRoadmap', required: true, index: true },
    completedSteps: [{ type: Schema.Types.ObjectId, ref: 'RoadmapStep' }],
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    startedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    streakCount: { type: Number, default: 0 },
    notes: { type: Map, of: String, default: {} },
    bookmarkedSteps: [{ type: Schema.Types.ObjectId, ref: 'RoadmapStep' }],
  },
  { timestamps: true }
);

// Prevent duplicate progress tracking for the same user and roadmap
userProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });
userProgressSchema.index({ roadmapId: 1, lastActiveAt: -1 });
userProgressSchema.index({ roadmapId: 1, completedAt: -1 });
userProgressSchema.index({ lastActiveAt: -1 });
userProgressSchema.index({ createdAt: -1 });

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', userProgressSchema);
