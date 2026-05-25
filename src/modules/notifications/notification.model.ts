import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
  PING_RECEIVED = 'ping_received',
  PING_ANSWERED = 'ping_answered',
  SESSION_BOOKED = 'session_booked',
  SESSION_ACCEPTED = 'session_accepted',
  SESSION_COMPLETED = 'session_completed',
  SESSION_REFLECTION_REQUESTED = 'session_reflection_requested',
  SESSION_REFLECTION_SUBMITTED = 'session_reflection_submitted',
  MENTOR_FOLLOWUP_ADDED = 'mentor_followup_added',
  REVIEW_RECEIVED = 'review_received',
  ROADMAP_COMPLETED = 'roadmap_completed',
  STEP_COMPLETED = 'step_completed',
  POST_REPLY = 'post_reply',
  POST_UPVOTED = 'post_upvoted',
  ANSWER_ACCEPTED = 'answer_accepted',
  POST_RESOLVED = 'post_resolved',
  GUIDE_FOLLOWED = 'guide_followed',
  WARNING_ISSUED = 'warning_issued',
  MENTOR_APPLICATION_SUBMITTED = 'mentor_application_submitted',
  MENTOR_APPLICATION_APPROVED = 'mentor_application_approved',
  MENTOR_APPLICATION_REJECTED = 'mentor_application_rejected',
  MENTOR_APPLICATION_CHANGES_REQUESTED = 'mentor_application_changes_requested',
  REPORT_SUBMITTED = 'report_submitted',
  REPORT_REVIEWED = 'report_reviewed',
  USER_SUSPENDED = 'user_suspended',
  FALSE_REPORT_PENALTY_APPLIED = 'false_report_penalty_applied',
  MENTORSHIP_REQUEST_RECEIVED = 'mentorship_request_received',
  MENTORSHIP_MESSAGE_RECEIVED = 'mentorship_message_received',
  SESSION_ESCALATION_REQUESTED = 'session_escalation_requested',
  SESSION_ESCALATION_ACCEPTED = 'session_escalation_accepted',
  SESSION_ESCALATION_DECLINED = 'session_escalation_declined',
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
