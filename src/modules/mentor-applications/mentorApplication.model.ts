import mongoose, { Document, Schema } from 'mongoose';

export enum MentorApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHANGES_REQUESTED = 'changes_requested',
}

export interface MentorApplicationUpload {
  url: string;
  provider: 'cloudinary' | 's3' | 'external';
  publicId?: string;
  mimeType?: string;
  sizeBytes?: number;
  originalName?: string;
}

export interface IMentorApplication extends Document {
  userId: mongoose.Types.ObjectId;
  bio: string;
  domains: string[];
  skills: string[];
  experienceYears: number;
  currentRole?: string;
  company?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  uploads: {
    resume?: MentorApplicationUpload;
    certifications: MentorApplicationUpload[];
    portfolioAssets: MentorApplicationUpload[];
  };
  motivation: string;
  expertiseSummary: string;
  availability: {
    text: string;
    hoursPerWeek?: number;
    timezone?: string;
    schedule: { day: string; slots: string[] }[];
  };
  status: MentorApplicationStatus;
  rejectionReason?: string;
  changeRequest?: string;
  internalNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const uploadSchema = new Schema<MentorApplicationUpload>(
  {
    url: { type: String, required: true },
    provider: { type: String, enum: ['cloudinary', 's3', 'external'], required: true },
    publicId: { type: String },
    mimeType: { type: String },
    sizeBytes: { type: Number, min: 0 },
    originalName: { type: String },
  },
  { _id: false }
);

const mentorApplicationSchema = new Schema<IMentorApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bio: { type: String, required: true, trim: true, maxlength: 2000 },
    domains: { type: [String], required: true, default: [] },
    skills: { type: [String], required: true, default: [] },
    experienceYears: { type: Number, required: true, min: 0, max: 60 },
    currentRole: { type: String, trim: true, maxlength: 120 },
    company: { type: String, trim: true, maxlength: 120 },
    linkedinUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
    resumeUrl: { type: String, trim: true },
    uploads: {
      resume: uploadSchema,
      certifications: { type: [uploadSchema], default: [] },
      portfolioAssets: { type: [uploadSchema], default: [] },
    },
    motivation: { type: String, required: true, trim: true, maxlength: 2000 },
    expertiseSummary: { type: String, required: true, trim: true, maxlength: 1600 },
    availability: {
      text: { type: String, required: true, trim: true, maxlength: 300 },
      hoursPerWeek: { type: Number, min: 1, max: 80 },
      timezone: { type: String, trim: true, maxlength: 80 },
      schedule: [
        {
          day: { type: String, required: true },
          slots: { type: [String], default: [] },
        },
      ],
    },
    status: {
      type: String,
      enum: Object.values(MentorApplicationStatus),
      default: MentorApplicationStatus.PENDING,
      index: true,
    },
    rejectionReason: { type: String, trim: true, maxlength: 1200 },
    changeRequest: { type: String, trim: true, maxlength: 1200 },
    internalNotes: { type: String, trim: true, maxlength: 3000 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

mentorApplicationSchema.index({ status: 1, createdAt: -1 });
mentorApplicationSchema.index({ userId: 1, status: 1 });

export const MentorApplication = mongoose.model<IMentorApplication>('MentorApplication', mentorApplicationSchema);
