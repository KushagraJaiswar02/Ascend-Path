import mongoose, { Document, Schema } from 'mongoose';

export type OpportunityType =
  | 'internship'
  | 'job'
  | 'freelance'
  | 'scholarship'
  | 'competition'
  | 'exam'
  | 'university'
  | 'bootcamp'
  | 'fellowship';

export type RemoteStatus = 'remote' | 'hybrid' | 'onsite';

export interface IOpportunity extends Document {
  title: string;
  slug: string;
  opportunityType: OpportunityType;
  organizationName: string;
  organizationLogo?: string;
  domains: string[];
  careerDomains: mongoose.Types.ObjectId[];
  careerGoals: mongoose.Types.ObjectId[];
  requiredSkills: string[];
  preferredSkills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  eligibilityCriteria?: string;
  location?: string;
  remoteStatus: RemoteStatus;
  stipend?: string;
  salaryRange?: string;
  applicationDeadline: Date;
  applicationLink: string;
  readinessSignals: string[];
  recommendedRoadmaps: mongoose.Types.ObjectId[];
  verificationStatus: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  creatorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const opportunitySchema = new Schema<IOpportunity>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    opportunityType: {
      type: String,
      enum: ['internship', 'job', 'freelance', 'scholarship', 'competition', 'exam', 'university', 'bootcamp', 'fellowship'],
      required: true,
      index: true,
    },
    organizationName: { type: String, required: true, trim: true },
    organizationLogo: { type: String, trim: true },
    domains: { type: [String], default: [] },
    careerDomains: { type: [Schema.Types.ObjectId], ref: 'CareerDomain', default: [], index: true },
    careerGoals: { type: [Schema.Types.ObjectId], ref: 'CareerGoal', default: [], index: true },
    requiredSkills: { type: [String], default: [] },
    preferredSkills: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
      index: true,
    },
    eligibilityCriteria: { type: String, trim: true },
    location: { type: String, trim: true },
    remoteStatus: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
      default: 'remote',
    },
    stipend: { type: String, trim: true },
    salaryRange: { type: String, trim: true },
    applicationDeadline: { type: Date, required: true, index: true },
    applicationLink: { type: String, required: true, trim: true },
    readinessSignals: { type: [String], default: [] },
    recommendedRoadmaps: { type: [Schema.Types.ObjectId], ref: 'CareerRoadmap', default: [] },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

// High-performance production indexes
opportunitySchema.index({ opportunityType: 1, verificationStatus: 1, applicationDeadline: 1 });
opportunitySchema.index({ careerDomains: 1, verificationStatus: 1, isFeatured: -1 });
opportunitySchema.index({ title: 'text', organizationName: 'text', requiredSkills: 'text' });

export const Opportunity = mongoose.model<IOpportunity>('Opportunity', opportunitySchema);
