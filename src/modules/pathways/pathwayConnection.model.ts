import mongoose, { Document, Schema } from 'mongoose';

export type PathwayRelationshipType =
  | 'adjacent_career'
  | 'specialization'
  | 'beginner_to_advanced'
  | 'interdisciplinary'
  | 'skill_transition'
  | 'outcome_path';

export interface IPathwayConnection extends Document {
  sourceDomain: mongoose.Types.ObjectId;
  targetDomain: mongoose.Types.ObjectId;
  relationshipType: PathwayRelationshipType;
  overlapStrength: number;
  requiredSkills: string[];
  opportunityOutcomes: string[];
  decisionSignals: string[];
  estimatedTimelineWeeks?: number;
  suggestedRoadmaps: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pathwayConnectionSchema = new Schema<IPathwayConnection>(
  {
    sourceDomain: { type: Schema.Types.ObjectId, ref: 'CareerDomain', required: true, index: true },
    targetDomain: { type: Schema.Types.ObjectId, ref: 'CareerDomain', required: true, index: true },
    relationshipType: {
      type: String,
      enum: ['adjacent_career', 'specialization', 'beginner_to_advanced', 'interdisciplinary', 'skill_transition', 'outcome_path'],
      required: true,
      index: true,
    },
    overlapStrength: { type: Number, default: 50, min: 0, max: 100, index: true },
    requiredSkills: { type: [String], default: [] },
    opportunityOutcomes: { type: [String], default: [] },
    decisionSignals: { type: [String], default: [] },
    estimatedTimelineWeeks: { type: Number, min: 1, max: 520 },
    suggestedRoadmaps: { type: [Schema.Types.ObjectId], ref: 'CareerRoadmap', default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

pathwayConnectionSchema.index({ sourceDomain: 1, targetDomain: 1, relationshipType: 1 }, { unique: true });
pathwayConnectionSchema.index({ sourceDomain: 1, isActive: 1, overlapStrength: -1 });

export const PathwayConnection = mongoose.model<IPathwayConnection>('PathwayConnection', pathwayConnectionSchema);
