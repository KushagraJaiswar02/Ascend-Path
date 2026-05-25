import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerCompanionProfile extends Document {
  userId: mongoose.Types.ObjectId;
  aspirations: string[];
  activeGoals: mongoose.Types.ObjectId[];
  evolvingInterests: string[];
  confidenceTrend: {
    current?: number;
    previous?: number;
    direction: 'rising' | 'falling' | 'steady' | 'unknown';
    samples: { value: number; source: string; capturedAt: Date }[];
  };
  learningPatterns: {
    preferredPace?: 'light' | 'steady' | 'intensive';
    consistencyScore: number;
    averageDaysBetweenActivity?: number;
    lastActiveAt?: Date;
  };
  momentum: {
    score: number;
    status: 'building' | 'steady' | 'stalled' | 'recovering' | 'unknown';
    streakCount: number;
    lastMomentumAt?: Date;
  };
  blockers: {
    type: string;
    label: string;
    severity: 'low' | 'medium' | 'high';
    detectedAt: Date;
    resolvedAt?: Date;
    evidence: string[];
  }[];
  milestones: {
    title: string;
    category: string;
    entityId?: mongoose.Types.ObjectId;
    occurredAt: Date;
  }[];
  reflectionSummaries: {
    recurringInterests: string[];
    recurringStruggles: string[];
    evolvingGoals: string[];
    uncertaintyThemes: string[];
  };
  mentorshipHistory: {
    mentorId: mongoose.Types.ObjectId;
    sessionCount: number;
    lastSessionAt?: Date;
  }[];
  privacy: {
    shareProgressSummaryWithMentors: boolean;
    shareBlockerSignalsWithMentors: boolean;
    shareJournalWithMentors: boolean;
  };
  lastAnalyzedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blockerSchema = new Schema(
  {
    type: { type: String, required: true },
    label: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    detectedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    evidence: { type: [String], default: [] },
  },
  { _id: false }
);

const careerCompanionProfileSchema = new Schema<ICareerCompanionProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    aspirations: { type: [String], default: [] },
    activeGoals: { type: [Schema.Types.ObjectId], ref: 'CareerGoal', default: [] },
    evolvingInterests: { type: [String], default: [] },
    confidenceTrend: {
      current: { type: Number, min: 1, max: 5 },
      previous: { type: Number, min: 1, max: 5 },
      direction: { type: String, enum: ['rising', 'falling', 'steady', 'unknown'], default: 'unknown' },
      samples: {
        type: [
          {
            value: { type: Number, min: 1, max: 5, required: true },
            source: { type: String, required: true },
            capturedAt: { type: Date, default: Date.now },
            _id: false,
          },
        ],
        default: [],
      },
    },
    learningPatterns: {
      preferredPace: { type: String, enum: ['light', 'steady', 'intensive'] },
      consistencyScore: { type: Number, default: 0, min: 0, max: 100 },
      averageDaysBetweenActivity: { type: Number },
      lastActiveAt: { type: Date },
    },
    momentum: {
      score: { type: Number, default: 0, min: 0, max: 100 },
      status: { type: String, enum: ['building', 'steady', 'stalled', 'recovering', 'unknown'], default: 'unknown' },
      streakCount: { type: Number, default: 0 },
      lastMomentumAt: { type: Date },
    },
    blockers: { type: [blockerSchema], default: [] },
    milestones: {
      type: [
        {
          title: { type: String, required: true },
          category: { type: String, required: true },
          entityId: { type: Schema.Types.ObjectId },
          occurredAt: { type: Date, default: Date.now },
          _id: false,
        },
      ],
      default: [],
    },
    reflectionSummaries: {
      recurringInterests: { type: [String], default: [] },
      recurringStruggles: { type: [String], default: [] },
      evolvingGoals: { type: [String], default: [] },
      uncertaintyThemes: { type: [String], default: [] },
    },
    mentorshipHistory: {
      type: [
        {
          mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          sessionCount: { type: Number, default: 0 },
          lastSessionAt: { type: Date },
          _id: false,
        },
      ],
      default: [],
    },
    privacy: {
      shareProgressSummaryWithMentors: { type: Boolean, default: true },
      shareBlockerSignalsWithMentors: { type: Boolean, default: true },
      shareJournalWithMentors: { type: Boolean, default: false },
    },
    lastAnalyzedAt: { type: Date },
  },
  { timestamps: true }
);

careerCompanionProfileSchema.index({ 'momentum.status': 1, 'momentum.score': -1 });
careerCompanionProfileSchema.index({ 'confidenceTrend.direction': 1 });

export const CareerCompanionProfile = mongoose.model<ICareerCompanionProfile>('CareerCompanionProfile', careerCompanionProfileSchema);
