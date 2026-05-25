import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendationProfile extends Document {
  userId: mongoose.Types.ObjectId;
  careerDomains: mongoose.Types.ObjectId[];
  careerGoals: mongoose.Types.ObjectId[];
  careerStage?: string;
  preferredLanguages: string[];
  budgetRange?: string;
  weeklyCommitment?: string;
  learningStyle?: string;
  targetRole?: string;
  inferredInterests: string[];
  engagementPatterns: {
    roadmapEnrollments: number;
    roadmapCompletions: number;
    sessionBookings: number;
    sessionAttendance: number;
    recommendationClicks: number;
    recommendationIgnores: number;
  };
  recommendationWeights: {
    domain: number;
    goal: number;
    stage: number;
    language: number;
    budget: number;
    quality: number;
    freshness: number;
    behavior: number;
  };
  lastComputedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const recommendationProfileSchema = new Schema<IRecommendationProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    careerDomains: { type: [Schema.Types.ObjectId], ref: 'CareerDomain', default: [], index: true },
    careerGoals: { type: [Schema.Types.ObjectId], ref: 'CareerGoal', default: [], index: true },
    careerStage: { type: String, trim: true, index: true },
    preferredLanguages: { type: [String], default: [] },
    budgetRange: { type: String, trim: true },
    weeklyCommitment: { type: String, trim: true },
    learningStyle: { type: String, trim: true },
    targetRole: { type: String, trim: true },
    inferredInterests: { type: [String], default: [] },
    engagementPatterns: {
      roadmapEnrollments: { type: Number, default: 0 },
      roadmapCompletions: { type: Number, default: 0 },
      sessionBookings: { type: Number, default: 0 },
      sessionAttendance: { type: Number, default: 0 },
      recommendationClicks: { type: Number, default: 0 },
      recommendationIgnores: { type: Number, default: 0 },
    },
    recommendationWeights: {
      domain: { type: Number, default: 30 },
      goal: { type: Number, default: 18 },
      stage: { type: Number, default: 12 },
      language: { type: Number, default: 10 },
      budget: { type: Number, default: 8 },
      quality: { type: Number, default: 12 },
      freshness: { type: Number, default: 5 },
      behavior: { type: Number, default: 5 },
    },
    lastComputedAt: { type: Date },
  },
  { timestamps: true }
);

recommendationProfileSchema.index({ careerDomains: 1, careerStage: 1 });
recommendationProfileSchema.index({ careerGoals: 1, careerStage: 1 });

export const RecommendationProfile = mongoose.model<IRecommendationProfile>('RecommendationProfile', recommendationProfileSchema);
