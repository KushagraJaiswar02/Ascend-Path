import mongoose, { Document, Schema } from 'mongoose';

export enum MentorshipConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  BLOCKED = 'blocked',
}

export enum MentorshipStartedFrom {
  ROADMAP = 'roadmap',
  OPPORTUNITY = 'opportunity',
  MENTOR_PROFILE = 'mentor-profile',
  DASHBOARD = 'dashboard',
  DOMAIN_PAGE = 'domain-page',
  PING = 'ping',
}

export enum MentorshipMessageType {
  TEXT = 'text',
  RESOURCE = 'resource',
  ROADMAP = 'roadmap',
  OPPORTUNITY = 'opportunity',
  SESSION_REQUEST = 'session-request',
}

export enum SessionEscalationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  ALTERNATE_PROPOSED = 'alternate_proposed',
  ASYNC_CONTINUED = 'async_continued',
  WORKSHOP_RECOMMENDED = 'workshop_recommended',
}

export interface IMentorshipConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  mentorId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  status: MentorshipConversationStatus;
  startedFrom: MentorshipStartedFrom;
  linkedRoadmapId?: mongoose.Types.ObjectId;
  linkedOpportunityId?: mongoose.Types.ObjectId;
  linkedDomainId?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  unreadCounts: Map<string, number>;
  participantStates: {
    userId: mongoose.Types.ObjectId;
    archivedAt?: Date;
    blockedAt?: Date;
    lastReadAt?: Date;
    pinnedAdvice?: string;
    mutedUntil?: Date;
  }[];
  activeSessionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMentorshipMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  messageType: MentorshipMessageType;
  content: string;
  attachments: { label: string; url: string; type?: string }[];
  linkedRoadmapId?: mongoose.Types.ObjectId;
  linkedOpportunityId?: mongoose.Types.ObjectId;
  isEdited: boolean;
  editedAt?: Date;
  readBy: { userId: mongoose.Types.ObjectId; readAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionEscalationRequest extends Document {
  conversationId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  topic: string;
  objective: string;
  roadmapArea?: string;
  urgency: 'low' | 'normal' | 'high';
  preferredSlots: string[];
  expectedHelpType: string;
  status: SessionEscalationStatus;
  mentorResponse?: string;
  proposedSlots: string[];
  sessionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const participantStateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    archivedAt: { type: Date },
    blockedAt: { type: Date },
    lastReadAt: { type: Date },
    pinnedAdvice: { type: String, trim: true, maxlength: 2000 },
    mutedUntil: { type: Date },
  },
  { _id: false }
);

const mentorshipConversationSchema = new Schema<IMentorshipConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    menteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: Object.values(MentorshipConversationStatus), default: MentorshipConversationStatus.ACTIVE },
    startedFrom: { type: String, enum: Object.values(MentorshipStartedFrom), default: MentorshipStartedFrom.MENTOR_PROFILE },
    linkedRoadmapId: { type: Schema.Types.ObjectId, ref: 'CareerRoadmap' },
    linkedOpportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity' },
    linkedDomainId: { type: Schema.Types.ObjectId, ref: 'CareerDomain' },
    lastMessageAt: { type: Date },
    lastMessagePreview: { type: String, trim: true, maxlength: 280 },
    unreadCounts: { type: Map, of: Number, default: {} },
    participantStates: { type: [participantStateSchema], default: [] },
    activeSessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
  },
  { timestamps: true }
);

const mentorshipMessageSchema = new Schema<IMentorshipMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'MentorshipConversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messageType: { type: String, enum: Object.values(MentorshipMessageType), default: MentorshipMessageType.TEXT },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
    attachments: {
      type: [{ label: { type: String, required: true }, url: { type: String, required: true }, type: { type: String } }],
      default: [],
    },
    linkedRoadmapId: { type: Schema.Types.ObjectId, ref: 'CareerRoadmap' },
    linkedOpportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity' },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    readBy: {
      type: [{ userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, readAt: { type: Date, default: Date.now } }],
      default: [],
    },
  },
  { timestamps: true }
);

const sessionEscalationRequestSchema = new Schema<ISessionEscalationRequest>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'MentorshipConversation', required: true, index: true },
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    menteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true, trim: true, maxlength: 160 },
    objective: { type: String, required: true, trim: true, maxlength: 1200 },
    roadmapArea: { type: String, trim: true, maxlength: 160 },
    urgency: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    preferredSlots: { type: [String], default: [] },
    expectedHelpType: { type: String, required: true, trim: true, maxlength: 120 },
    status: { type: String, enum: Object.values(SessionEscalationStatus), default: SessionEscalationStatus.PENDING },
    mentorResponse: { type: String, trim: true, maxlength: 1200 },
    proposedSlots: { type: [String], default: [] },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
  },
  { timestamps: true }
);

mentorshipConversationSchema.index({ participants: 1, updatedAt: -1 });
mentorshipConversationSchema.index({ mentorId: 1, status: 1, lastMessageAt: -1 });
mentorshipConversationSchema.index({ menteeId: 1, status: 1, lastMessageAt: -1 });
mentorshipConversationSchema.index({ lastMessageAt: -1 });
mentorshipConversationSchema.index({ mentorId: 1, menteeId: 1 }, { unique: true });
mentorshipConversationSchema.index({ 'unreadCounts.$**': 1 });
mentorshipMessageSchema.index({ conversationId: 1, createdAt: -1 });
sessionEscalationRequestSchema.index({ mentorId: 1, status: 1, updatedAt: -1 });
sessionEscalationRequestSchema.index({ menteeId: 1, status: 1, updatedAt: -1 });

export const MentorshipConversation = mongoose.model<IMentorshipConversation>('MentorshipConversation', mentorshipConversationSchema);
export const MentorshipMessage = mongoose.model<IMentorshipMessage>('MentorshipMessage', mentorshipMessageSchema);
export const SessionEscalationRequest = mongoose.model<ISessionEscalationRequest>('SessionEscalationRequest', sessionEscalationRequestSchema);
