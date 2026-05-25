import mongoose, { Document, Schema } from 'mongoose';

export type GrowthTimelineEventType =
  | 'onboarding_completed'
  | 'roadmap_started'
  | 'roadmap_step_completed'
  | 'roadmap_completed'
  | 'session_booked'
  | 'session_completed'
  | 'reflection_submitted'
  | 'mentor_followup_added'
  | 'pathway_transition'
  | 'achievement'
  | 'check_in'
  | 'journal_entry'
  | 'blocker_detected'
  | 'application_submitted'
  | 'application_shortlisted'
  | 'application_interviewing'
  | 'application_rejected'
  | 'application_accepted'
  | 'application_archived'
  | 'certification_earned'
  | 'internship_obtained'
  | 'exam_attempted';

export interface IGrowthTimelineEvent extends Document {
  userId: mongoose.Types.ObjectId;
  type: GrowthTimelineEventType;
  title: string;
  summary?: string;
  entityId?: mongoose.Types.ObjectId;
  entityType?: string;
  visibility: 'private' | 'mentor_summary';
  metadata?: Record<string, any>;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const growthTimelineEventSchema = new Schema<IGrowthTimelineEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'onboarding_completed',
        'roadmap_started',
        'roadmap_step_completed',
        'roadmap_completed',
        'session_booked',
        'session_completed',
        'reflection_submitted',
        'mentor_followup_added',
        'pathway_transition',
        'achievement',
        'check_in',
        'journal_entry',
        'blocker_detected',
        'application_submitted',
        'application_shortlisted',
        'application_interviewing',
        'application_rejected',
        'application_accepted',
        'application_archived',
        'certification_earned',
        'internship_obtained',
        'exam_attempted',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    summary: { type: String, trim: true, maxlength: 1000 },
    entityId: { type: Schema.Types.ObjectId },
    entityType: { type: String },
    visibility: { type: String, enum: ['private', 'mentor_summary'], default: 'private' },
    metadata: { type: Schema.Types.Mixed },
    occurredAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

growthTimelineEventSchema.index({ userId: 1, occurredAt: -1 });

export const GrowthTimelineEvent = mongoose.model<IGrowthTimelineEvent>('GrowthTimelineEvent', growthTimelineEventSchema);
