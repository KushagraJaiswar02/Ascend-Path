import mongoose, { Document, Schema } from 'mongoose';

export enum TargetType {
  POST = 'post',
  REPLY = 'reply',
  USER = 'user',
  REVIEW = 'review',
  ROADMAP = 'roadmap',
  SESSION = 'session',
  GUIDE_PROFILE = 'guide_profile',
  PORTFOLIO_PROJECT = 'portfolio_project',
  ENDORSEMENT = 'endorsement',
  VERIFIED_ACHIEVEMENT = 'verified_achievement',
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  ABUSE = 'abuse',
  MISINFORMATION = 'misinformation',
  FAKE_MENTOR = 'fake_mentor',
  SCAM = 'scam',
  INAPPROPRIATE = 'inappropriate_content',
  HATE_SPEECH = 'hate_speech',
  SESSION_MISCONDUCT = 'session_misconduct',
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

export enum ModeratorDecision {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  ACTION_TAKEN = 'action_taken',
  DISMISSED = 'dismissed',
  FALSE_REPORT = 'false_report',
  ESCALATED = 'escalated',
}

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetType: TargetType;
  targetId: mongoose.Types.ObjectId;

  reason: ReportReason; // Backwards compatibility
  reasonCategory: ReportReason;
  detailedReason: string;

  evidenceLinks: string[];
  screenshots: string[];

  status: ReportStatus;
  priority: ReportPriority;
  assignedModerator?: mongoose.Types.ObjectId;

  moderatorDecision: ModeratorDecision;
  moderatorNotes?: string;

  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;

  falseReportStrike: boolean;
  metadata?: Record<string, any>;

  // Compatibility fields
  details?: string;
  description?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  resolution?: string;

  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: Object.values(TargetType), required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, enum: Object.values(ReportReason) },
    reasonCategory: { type: String, enum: Object.values(ReportReason), required: true },
    detailedReason: { type: String, required: true },
    evidenceLinks: { type: [String], default: [] },
    screenshots: { type: [String], default: [] },
    status: { type: String, enum: Object.values(ReportStatus), default: ReportStatus.PENDING },
    priority: { type: String, enum: Object.values(ReportPriority), default: ReportPriority.MEDIUM },
    assignedModerator: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatorDecision: { type: String, enum: Object.values(ModeratorDecision), default: ModeratorDecision.PENDING },
    moderatorNotes: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    falseReportStrike: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
    details: { type: String },
    description: { type: String },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    resolution: { type: String },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, priority: 1, createdAt: 1 });
reportSchema.index({ assignedModerator: 1, status: 1 });
reportSchema.index({ targetId: 1, targetType: 1 });
reportSchema.index({ reasonCategory: 1, createdAt: -1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);
