import mongoose, { Document, Schema } from 'mongoose';

export enum TargetType {
  POST = 'post',
  REPLY = 'reply',
  USER = 'user',
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  MISINFORMATION = 'misinformation',
  INAPPROPRIATE = 'inappropriate',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACTIONED = 'actioned',
  DISMISSED = 'dismissed',
}

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetType: TargetType;
  targetId: mongoose.Types.ObjectId;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: Object.values(TargetType), required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, enum: Object.values(ReportReason), required: true },
    details: { type: String },
    status: { type: String, enum: Object.values(ReportStatus), default: ReportStatus.PENDING },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: 1 });
reportSchema.index({ targetId: 1, targetType: 1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);
