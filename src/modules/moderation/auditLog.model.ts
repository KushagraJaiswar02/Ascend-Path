import mongoose, { Document, Schema } from 'mongoose';

export enum AuditAction {
  WARN = 'warn',
  MUTE = 'mute',
  BAN = 'ban',
  UNBAN = 'unban',
  DELETE_POST = 'delete_post',
  VERIFY_GUIDE = 'verify_guide',
  ROLE_CHANGE = 'role_change',
}

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  action: AuditAction;
  targetId: mongoose.Types.ObjectId;
  details: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: Object.values(AuditAction), required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    details: { type: String, required: true },
  },
  { timestamps: true }
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ targetId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
