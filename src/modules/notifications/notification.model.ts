import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
  PING_RECEIVED = 'ping_received',
  PING_ANSWERED = 'ping_answered',
  SESSION_BOOKED = 'session_booked',
  SESSION_REMINDER = 'session_reminder',
  POST_REPLY = 'post_reply',
  RESPECT_MILESTONE = 'respect_milestone',
  ROLE_UPGRADE = 'role_upgrade',
  WARNING_ISSUED = 'warning_issued',
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// High performance index for fetching a user's unread inbox
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
