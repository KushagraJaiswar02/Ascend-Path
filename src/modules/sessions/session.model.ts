import mongoose, { Document, Schema } from 'mongoose';

export enum SessionStatus {
  OPEN = 'open',
  BOOKED = 'booked',
  STARTED = 'started',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SCHEDULED = 'scheduled',
  REGISTRATION_OPEN = 'registration_open',
  LIVE = 'live',
  ENDED = 'ended',
  ARCHIVED = 'archived',
}

export enum SessionType {
  PRIVATE_MENTORSHIP = 'private_mentorship',
  PUBLIC_WORKSHOP = 'public_workshop',
}

export enum RegistrationMode {
  OPEN = 'open',
  APPROVAL = 'approval',
  INVITE_ONLY = 'invite_only',
}

export enum SessionCategory {
  WORKSHOP = 'workshop',
  AMA = 'ama',
  ROADMAP_WALKTHROUGH = 'roadmap_walkthrough',
  STUDY_EVENT = 'study_event',
  COMMUNITY_TEACHING = 'community_teaching',
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
  sessionType: SessionType;
  title: string;
  topic: string;
  description?: string;
  domains?: string[];
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  scheduledAt: Date;
  durationMinutes: number;
  price: number;
  status: SessionStatus;
  isPublic: boolean;
  capacity?: number;
  attendeeCount: number;
  bannerImage?: string;
  thumbnail?: string;
  roadmapId?: mongoose.Types.ObjectId;
  registrationMode: RegistrationMode;
  sessionCategory?: SessionCategory;
  resources: { title: string; url: string; type?: string }[];
  recordingUrl?: string;
  attendees: {
    userId: mongoose.Types.ObjectId;
    registeredAt: Date;
    attendedAt?: Date;
  }[];
  waitlist: {
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
  }[];
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
    sessionType: {
      type: String,
      enum: Object.values(SessionType),
      default: SessionType.PRIVATE_MENTORSHIP,
    },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    description: { type: String },
    domains: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    price: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.OPEN,
    },
    isPublic: { type: Boolean, default: false },
    capacity: { type: Number, min: 1 },
    attendeeCount: { type: Number, default: 0, min: 0 },
    bannerImage: { type: String },
    thumbnail: { type: String },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'CareerRoadmap' },
    registrationMode: {
      type: String,
      enum: Object.values(RegistrationMode),
      default: RegistrationMode.OPEN,
    },
    sessionCategory: {
      type: String,
      enum: Object.values(SessionCategory),
    },
    resources: {
      type: [
        {
          title: { type: String, required: true },
          url: { type: String, required: true },
          type: { type: String },
        },
      ],
      default: [],
    },
    recordingUrl: { type: String },
    attendees: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          registeredAt: { type: Date, default: Date.now },
          attendedAt: { type: Date },
        },
      ],
      default: [],
    },
    waitlist: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          joinedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
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
sessionSchema.index({ sessionType: 1, status: 1, scheduledAt: 1 });
sessionSchema.index({ isPublic: 1, scheduledAt: 1 });
sessionSchema.index({ scheduledAt: 1 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);
