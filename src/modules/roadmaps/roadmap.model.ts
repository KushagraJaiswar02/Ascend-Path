import mongoose, { Document, Schema } from 'mongoose';

// --- Roadmap Definition ---
export interface ICareerRoadmap extends Document {
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  domains: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedWeeks?: number;
  createdBy: mongoose.Types.ObjectId;
  enrollmentCount: number;
  averageRating: number;
  isPublished: boolean;
  prerequisites: string[];
  learningOutcomes: string[];
  visibility: 'public' | 'private' | 'unlisted';
  moderationStatus: 'visible' | 'hidden' | 'deleted';
  hiddenAt?: Date;
  deletedAt?: Date;
  // Legacy fields kept for backward compatibility
  targetRole?: string;
  domain?: string;
  isPublic: boolean;
  followerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const careerRoadmapSchema = new Schema<ICareerRoadmap>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    thumbnail: { type: String },
    domains: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    estimatedWeeks: { type: Number },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    enrollmentCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    prerequisites: { type: [String], default: [] },
    learningOutcomes: { type: [String], default: [] },
    visibility: { type: String, enum: ['public', 'private', 'unlisted'], default: 'public' },
    moderationStatus: { type: String, enum: ['visible', 'hidden', 'deleted'], default: 'visible' },
    hiddenAt: { type: Date },
    deletedAt: { type: Date },
    // Legacy fields kept for compatibility
    targetRole: { type: String },
    domain: { type: String },
    isPublic: { type: Boolean, default: false },
    followerCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// High performance indexes
careerRoadmapSchema.index({ domains: 1, difficulty: 1, isPublished: 1 });
careerRoadmapSchema.index({ createdBy: 1 });
careerRoadmapSchema.index({ moderationStatus: 1, createdAt: -1 });

export const CareerRoadmap = mongoose.model<ICareerRoadmap>('CareerRoadmap', careerRoadmapSchema);

// --- Roadmap Section Definition ---
export interface IRoadmapSection extends Document {
  roadmapId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const roadmapSectionSchema = new Schema<IRoadmapSection>(
  {
    roadmapId: { type: Schema.Types.ObjectId, ref: 'CareerRoadmap', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Index for sorted queries
roadmapSectionSchema.index({ roadmapId: 1, order: 1 });

export const RoadmapSection = mongoose.model<IRoadmapSection>('RoadmapSection', roadmapSectionSchema);

// --- Roadmap Step Definition ---
export interface IStepResource {
  type: string;
  title: string;
  url: string;
}

export interface IRoadmapStep extends Document {
  roadmapId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: 'article' | 'video' | 'project' | 'assignment' | 'quiz' | 'session' | 'external resource';
  resources: IStepResource[];
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  isOptional: boolean;
  linkedSessionId?: mongoose.Types.ObjectId;
  richNotes?: string;
  videoUrl?: string;
  mentorTip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const roadmapStepSchema = new Schema<IRoadmapStep>(
  {
    roadmapId: { type: Schema.Types.ObjectId, ref: 'CareerRoadmap', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'RoadmapSection', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['article', 'video', 'project', 'assignment', 'quiz', 'session', 'external resource'],
      required: true,
      default: 'article',
    },
    resources: [
      {
        type: { type: String, required: true },
        title: { type: String, required: true },
        url: { type: String, required: true },
      }
    ],
    estimatedMinutes: { type: Number, default: 0 },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    order: { type: Number, required: true, default: 0 },
    isOptional: { type: Boolean, default: false },
    linkedSessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    richNotes: { type: String },
    videoUrl: { type: String },
    mentorTip: { type: String },
  },
  { timestamps: true }
);

// Indexes
roadmapStepSchema.index({ sectionId: 1, order: 1 });
roadmapStepSchema.index({ roadmapId: 1 });

export const RoadmapStep = mongoose.model<IRoadmapStep>('RoadmapStep', roadmapStepSchema);
