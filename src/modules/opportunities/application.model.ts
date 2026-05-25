import mongoose, { Document, Schema } from 'mongoose';

export type ApplicationStatus =
  | 'applied'
  | 'shortlisted'
  | 'interviewing'
  | 'rejected'
  | 'accepted'
  | 'archived';

export interface IApplicationReminder {
  date: Date;
  note: string;
  sent: boolean;
}

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  opportunityId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  notes?: string;
  reminders: IApplicationReminder[];
  mentorGuidance?: string;
  interviewReflections?: string;
  connectedProjects: mongoose.Types.ObjectId[];
  connectedAchievements: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const applicationReminderSchema = new Schema<IApplicationReminder>(
  {
    date: { type: Date, required: true },
    note: { type: String, required: true, trim: true },
    sent: { type: Boolean, default: false },
  },
  { _id: false }
);

const applicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true, index: true },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interviewing', 'rejected', 'accepted', 'archived'],
      default: 'applied',
      index: true,
    },
    notes: { type: String, trim: true, maxlength: 4000 },
    reminders: { type: [applicationReminderSchema], default: [] },
    mentorGuidance: { type: String, trim: true, maxlength: 4000 },
    interviewReflections: { type: String, trim: true, maxlength: 4000 },
    connectedProjects: [{ type: Schema.Types.ObjectId, ref: 'PortfolioProject', default: [] }],
    connectedAchievements: [{ type: Schema.Types.ObjectId, ref: 'VerifiedAchievement', default: [] }],
  },
  { timestamps: true }
);

// Ensure a user can only apply once to a specific opportunity
applicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });
applicationSchema.index({ userId: 1, status: 1 });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
