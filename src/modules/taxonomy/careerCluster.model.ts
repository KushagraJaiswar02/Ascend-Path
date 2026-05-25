import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerCluster extends Document {
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const careerClusterSchema = new Schema<ICareerCluster>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    icon: { type: String, trim: true, maxlength: 80 },
    color: { type: String, trim: true, maxlength: 40 },
    description: { type: String, trim: true, maxlength: 800 },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

careerClusterSchema.index({ isActive: 1, order: 1, name: 1 });

export const CareerCluster = mongoose.model<ICareerCluster>('CareerCluster', careerClusterSchema);
