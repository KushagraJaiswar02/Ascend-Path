import mongoose, { Document, Schema } from 'mongoose';

export interface IReputationAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'fame' | 'respect';
  action: 'session_completed' | 'review_received' | 'review_updated' | 'review_deleted' | 'review_reported' | 'forum_vote' | 'admin_adjustment';
  oldValue: number;
  newValue: number;
  delta: number;
  reason: string;
  referenceId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const reputationAuditLogSchema = new Schema<IReputationAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['fame', 'respect'], required: true },
    action: {
      type: String,
      enum: [
        'session_completed',
        'review_received',
        'review_updated',
        'review_deleted',
        'review_reported',
        'forum_vote',
        'admin_adjustment',
      ],
      required: true,
    },
    oldValue: { type: Number, required: true },
    newValue: { type: Number, required: true },
    delta: { type: Number, required: true },
    reason: { type: String, required: true, trim: true },
    referenceId: { type: Schema.Types.ObjectId },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// High-performance audit indexes
reputationAuditLogSchema.index({ userId: 1, createdAt: -1 });
reputationAuditLogSchema.index({ action: 1 });

export const ReputationAuditLog = mongoose.model<IReputationAuditLog>(
  'ReputationAuditLog',
  reputationAuditLogSchema
);
