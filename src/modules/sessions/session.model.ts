import mongoose, { Document, Schema } from 'mongoose';

export enum SessionStatus {
  OPEN = 'open',
  BOOKED = 'booked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MeetingProvider {
  JITSI = 'jitsi',
  GOOGLE_MEET = 'google_meet',
  ZOOM = 'zoom',
  DAILY = 'daily',
  LIVEKIT = 'livekit',
}

export enum AttendanceStatus {
  SCHEDULED = 'scheduled',
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
}

export enum SessionExecutionState {
  SCHEDULED = 'scheduled',
  STARTED = 'started',
  PARTICIPANTS_JOINED = 'participants_joined',
  ACTIVE = 'active',
  ENDED = 'ended',
  REFLECTION_UNLOCKED = 'reflection_unlocked',
}

export interface ISession extends Document {
  guideId: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  title: string;
  topic: string;
  description?: string;
  scheduledAt: Date;
  durationMinutes: number;
  price: number;
  status: SessionStatus;
  meetingLink?: string;
  meetingProvider?: MeetingProvider;
  meetingUrl?: string;
  meetingRoomId?: string;
  startedAt?: Date;
  endedAt?: Date;
  mentorJoinedAt?: Date;
  menteeJoinedAt?: Date;
  actualDurationMinutes?: number;
  attendanceStatus: AttendanceStatus;
  sessionExecutionState: SessionExecutionState;
  rating?: number;
  review?: string;
  reviewId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    guideId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    description: { type: String },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    price: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.OPEN,
    },
    meetingLink: { type: String },
    meetingProvider: {
      type: String,
      enum: Object.values(MeetingProvider),
      default: MeetingProvider.JITSI,
    },
    meetingUrl: { type: String },
    meetingRoomId: { type: String, index: true },
    startedAt: { type: Date },
    endedAt: { type: Date },
    mentorJoinedAt: { type: Date },
    menteeJoinedAt: { type: Date },
    actualDurationMinutes: { type: Number, min: 0 },
    attendanceStatus: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.SCHEDULED,
    },
    sessionExecutionState: {
      type: String,
      enum: Object.values(SessionExecutionState),
      default: SessionExecutionState.SCHEDULED,
    },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
  },
  { timestamps: true }
);

// Indexes for faster lookups
sessionSchema.index({ guideId: 1, status: 1 });
sessionSchema.index({ clientId: 1, status: 1 });
sessionSchema.index({ scheduledAt: 1 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);
