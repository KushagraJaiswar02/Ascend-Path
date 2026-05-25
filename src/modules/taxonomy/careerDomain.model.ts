import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerDomain extends Document {
  clusterId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  aliases: string[];
  normalizedAliases: string[];
  description?: string;
  trendingScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const careerDomainSchema = new Schema<ICareerDomain>(
  {
    clusterId: { type: Schema.Types.ObjectId, ref: 'CareerCluster', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    aliases: { type: [String], default: [] },
    normalizedAliases: { type: [String], default: [], index: true },
    description: { type: String, trim: true, maxlength: 1200 },
    trendingScore: { type: Number, default: 0, min: 0, max: 100, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

careerDomainSchema.index({ clusterId: 1, isActive: 1, trendingScore: -1, name: 1 });
careerDomainSchema.index({ name: 'text', aliases: 'text', description: 'text' });

export const CareerDomain = mongoose.model<ICareerDomain>('CareerDomain', careerDomainSchema);
