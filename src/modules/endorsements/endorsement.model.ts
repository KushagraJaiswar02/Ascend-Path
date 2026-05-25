import mongoose, { Document, Schema } from 'mongoose';

export type EndorsementType = 'skill' | 'roadmap' | 'project' | 'general';

export interface IEndorsement extends Document {
  endorserId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  type: EndorsementType;
  skillName?: string;
  roadmapId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  message: string;
  moderationStatus: 'approved' | 'flagged' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

const endorsementSchema = new Schema<IEndorsement>(
  {
    endorserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['skill', 'roadmap', 'project', 'general'], required: true },
    skillName: { type: String, trim: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'CareerRoadmap' },
    projectId: { type: Schema.Types.ObjectId, ref: 'PortfolioProject' },
    message: { type: String, required: true, trim: true, minlength: 5, maxlength: 1000 },
    moderationStatus: {
      type: String,
      enum: ['approved', 'flagged', 'hidden'],
      default: 'approved',
      index: true,
    },
  },
  { timestamps: true }
);

endorsementSchema.index({ recipientId: 1, type: 1 });
endorsementSchema.index({ endorserId: 1, recipientId: 1 }, { unique: true }); // Prevent duplicate general/same endorsements from same mentor to same learner

export const Endorsement = mongoose.model<IEndorsement>('Endorsement', endorsementSchema);
