import mongoose, { Document, Schema } from 'mongoose';

export enum TargetType {
  POST = 'post',
  REPLY = 'reply',
  USER = 'user',
  REVIEW = 'review',
  ROADMAP = 'roadmap',
  GUIDE_PROFILE = 'guide_profile',
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  MISINFORMATION = 'misinformation',
  ABUSE = 'abuse',
  FAKE_MENTOR = 'fake_mentor',
  PLAGIARISM = 'plagiarism',
  INAPPROPRIATE = 'inappropriate',
  LOW_QUALITY = 'low_quality',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  REVIEWED = 'reviewed',
  ACTIONED = 'actioned',
  DISMISSED = 'dismissed',
}

export enum ReportPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetType: TargetType;
  targetId: mongoose.Types.ObjectId;
  reason: ReportReason;
  details?: string;
  description?: string;
  status: ReportStatus;
  priority: ReportPriority;
  assignedModerator?: mongoose.Types.ObjectId;
  resolvedBy?: mongoose.Types.ObjectId;
  resolution?: string;
  moderatorNotes?: string;
  resolvedAt?: Date;
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
    description: { type: String },
    status: { type: String, enum: Object.values(ReportStatus), default: ReportStatus.PENDING },
    priority: { type: String, enum: Object.values(ReportPriority), default: ReportPriority.MEDIUM },
    assignedModerator: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolution: { type: String },
    moderatorNotes: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, priority: 1, createdAt: 1 });
reportSchema.index({ assignedModerator: 1, status: 1 });
reportSchema.index({ targetId: 1, targetType: 1 });
reportSchema.index({ reason: 1, createdAt: -1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);
