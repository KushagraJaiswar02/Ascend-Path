import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
  PING_RECEIVED = 'ping_received',
  PING_ANSWERED = 'ping_answered',
  SESSION_BOOKED = 'session_booked',
  SESSION_ACCEPTED = 'session_accepted',
  SESSION_COMPLETED = 'session_completed',
  REVIEW_RECEIVED = 'review_received',
  ROADMAP_COMPLETED = 'roadmap_completed',
  STEP_COMPLETED = 'step_completed',
  POST_REPLY = 'post_reply',
  POST_UPVOTED = 'post_upvoted',
  GUIDE_FOLLOWED = 'guide_followed',
  WARNING_ISSUED = 'warning_issued',
}

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  actorId?: mongoose.Types.ObjectId;
  type: NotificationType;
  entityId?: mongoose.Types.ObjectId;
  entityType?: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId },
    entityType: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// High performance index for fetching a user's unread inbox
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);

