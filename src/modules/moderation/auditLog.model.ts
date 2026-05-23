import mongoose, { Document, Schema } from 'mongoose';

export enum AuditAction {
  WARN = 'warn',
  MUTE = 'mute',
  UNMUTE = 'unmute',
  BAN = 'ban',
  UNBAN = 'unban',
  SUSPEND = 'suspend',
  UNSUSPEND = 'unsuspend',
  DELETE_POST = 'delete_post',
  HIDE_CONTENT = 'hide_content',
  UNHIDE_CONTENT = 'unhide_content',
  CONTENT_DELETE = 'content_delete',
  VERIFY_GUIDE = 'verify_guide',
  UNVERIFY_GUIDE = 'unverify_guide',
  MENTOR_APPLICATION_SUBMITTED = 'mentor_application_submitted',
  MENTOR_APPLICATION_REVIEWED = 'mentor_application_reviewed',
  MENTOR_APPLICATION_APPROVED = 'mentor_application_approved',
  MENTOR_APPLICATION_REJECTED = 'mentor_application_rejected',
  MENTOR_APPLICATION_CHANGES_REQUESTED = 'mentor_application_changes_requested',
  ROLE_CHANGE = 'role_change',
  REPUTATION_ADJUST = 'reputation_adjust',
  REPORT_RESOLVE = 'report_resolve',
  REPORT_DISMISS = 'report_dismiss',
  REPORT_ASSIGN = 'report_assign',
  BULK_ACTION = 'bulk_action',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  action: AuditAction;
  targetId: mongoose.Types.ObjectId;
  targetType: string;
  details: string;
  metadata?: Record<string, unknown>;
  severity: AuditSeverity;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: Object.values(AuditAction), required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: { type: String, required: true, default: 'user' },
    details: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    severity: { type: String, enum: Object.values(AuditSeverity), default: AuditSeverity.INFO },
  },
  { timestamps: true }
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ targetId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
