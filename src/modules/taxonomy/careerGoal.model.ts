import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerGoal extends Document {
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
  applicableStages: string[];
  createdAt: Date;
  updatedAt: Date;
}

const careerGoalSchema = new Schema<ICareerGoal>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true, maxlength: 800 },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    applicableStages: { type: [String], default: [] },
  },
  { timestamps: true }
);

careerGoalSchema.index({ isActive: 1, order: 1, name: 1 });

export const CareerGoal = mongoose.model<ICareerGoal>('CareerGoal', careerGoalSchema);
