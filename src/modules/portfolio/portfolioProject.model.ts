import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolioProject extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  githubLink?: string;
  demoLink?: string;
  technologies: string[];
  domains: string[];
  roadmapId?: mongoose.Types.ObjectId;
  isMentorReviewed: boolean;
  reviewedBy?: mongoose.Types.ObjectId;
  mentorReviewNotes?: string;
  projectReflections: string;
  learningOutcomes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const portfolioProjectSchema = new Schema<IPortfolioProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    images: { type: [String], default: [] },
    githubLink: { type: String, trim: true },
    demoLink: { type: String, trim: true },
    technologies: { type: [String], default: [] },
    domains: { type: [String], default: [] },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'CareerRoadmap', index: true },
    isMentorReviewed: { type: Boolean, default: false, index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    mentorReviewNotes: { type: String, trim: true },
    projectReflections: { type: String, required: true, trim: true, maxlength: 3000 },
    learningOutcomes: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Search and listing index
portfolioProjectSchema.index({ technologies: 1 });
portfolioProjectSchema.index({ userId: 1, isMentorReviewed: 1 });

export const PortfolioProject = mongoose.model<IPortfolioProject>('PortfolioProject', portfolioProjectSchema);
