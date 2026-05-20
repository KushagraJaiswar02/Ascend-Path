import mongoose, { Document, Schema } from 'mongoose';

export interface IRoadmapStep {
  title: string;
  description?: string;
  resources: string[];
  milestoneCheck: boolean;
}

export interface ICareerRoadmap extends Document {
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  targetRole?: string;
  domain?: string;
  estimatedWeeks?: number;
  steps: IRoadmapStep[];
  isPublic: boolean;
  followerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const roadmapStepSchema = new Schema<IRoadmapStep>({
  title: { type: String, required: true },
  description: { type: String },
  resources: [{ type: String }],
  milestoneCheck: { type: Boolean, default: false },
});

const careerRoadmapSchema = new Schema<ICareerRoadmap>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    targetRole: { type: String },
    domain: { type: String },
    estimatedWeeks: { type: Number },
    steps: [roadmapStepSchema],
    isPublic: { type: Boolean, default: false },
    followerCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CareerRoadmap = mongoose.model<ICareerRoadmap>('CareerRoadmap', careerRoadmapSchema);
