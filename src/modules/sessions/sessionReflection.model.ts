import mongoose, { Document, Schema } from 'mongoose';

export enum SessionReflectionStatus {
  REQUESTED = 'requested',
  MENTEE_SUBMITTED = 'mentee_submitted',
  FOLLOWUP_ADDED = 'followup_added',
  COMPLETED = 'completed',
}

export interface IRecommendedRoadmapStep {
  roadmapId?: mongoose.Types.ObjectId;
  stepId?: mongoose.Types.ObjectId;
  title: string;
  reason?: string;
}

export interface IRecommendedResource {
  title: string;
  url: string;
  type?: 'article' | 'video' | 'course' | 'tool' | 'docs' | 'other';
}

export interface IRecommendedProject {
  title: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ISessionReflection extends Document {
  sessionId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  menteeReflection?: {
    learnings: string;
    confidenceLevel: number;
    nextChallenge: string;
    submittedAt?: Date;
  };
  mentorFollowup?: {
    recommendedRoadmapSteps: IRecommendedRoadmapStep[];
    recommendedResources: IRecommendedResource[];
    recommendedProjects: IRecommendedProject[];
    recommendedOpportunities?: {
      opportunityId: mongoose.Types.ObjectId;
      title: string;
      reason?: string;
    }[];
    mentorNotes?: string;
    nextSessionSuggestion?: string;
    submittedAt?: Date;
  };
  status: SessionReflectionStatus;
  requestedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const recommendedRoadmapStepSchema = new Schema<IRecommendedRoadmapStep>(
  {
    roadmapId: { type: Schema.Types.ObjectId, ref: 'CareerRoadmap' },
    stepId: { type: Schema.Types.ObjectId, ref: 'RoadmapStep' },
    title: { type: String, required: true, trim: true },
    reason: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const sessionReflectionSchema = new Schema<ISessionReflection>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true, unique: true },
    menteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    menteeReflection: {
      learnings: { type: String, trim: true, maxlength: 3000 },
      confidenceLevel: { type: Number, min: 1, max: 5 },
      nextChallenge: { type: String, trim: true, maxlength: 1500 },
      submittedAt: { type: Date },
    },
    mentorFollowup: {
      recommendedRoadmapSteps: { type: [recommendedRoadmapStepSchema], default: [] },
      recommendedResources: {
        type: [
          {
            title: { type: String, required: true, trim: true },
            url: { type: String, required: true, trim: true },
            type: {
              type: String,
              enum: ['article', 'video', 'course', 'tool', 'docs', 'other'],
              default: 'other',
            },
          },
        ],
        default: [],
      },
      recommendedProjects: {
        type: [
          {
            title: { type: String, required: true, trim: true },
            description: { type: String, trim: true, maxlength: 1000 },
            difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
          },
        ],
        default: [],
      },
      recommendedOpportunities: {
        type: [
          {
            opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
            title: { type: String, required: true },
            reason: { type: String, trim: true },
          },
        ],
        default: [],
      },
      mentorNotes: { type: String, trim: true, maxlength: 3000 },
      nextSessionSuggestion: { type: String, trim: true, maxlength: 1000 },
      submittedAt: { type: Date },
    },
    status: {
      type: String,
      enum: Object.values(SessionReflectionStatus),
      default: SessionReflectionStatus.REQUESTED,
    },
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

sessionReflectionSchema.index({ menteeId: 1, status: 1, updatedAt: -1 });
sessionReflectionSchema.index({ mentorId: 1, status: 1, updatedAt: -1 });

export const SessionReflection = mongoose.model<ISessionReflection>('SessionReflection', sessionReflectionSchema);
