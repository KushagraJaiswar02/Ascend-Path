export interface MentorshipUser {
  _id: string;
  name: string;
  role: string;
  avatar?: string;
  headline?: string;
}

export interface MentorshipConversation {
  _id: string;
  participants: string[];
  mentorId: MentorshipUser;
  menteeId: MentorshipUser;
  status: 'active' | 'archived' | 'blocked';
  startedFrom: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCounts?: Record<string, number>;
  participantStates?: Array<{ userId: string; pinnedAdvice?: string; lastReadAt?: string }>;
  activeSessionId?: any;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipMessage {
  _id: string;
  conversationId: string;
  senderId: MentorshipUser;
  messageType: 'text' | 'resource' | 'roadmap' | 'opportunity' | 'session-request';
  content: string;
  attachments: Array<{ label: string; url: string; type?: string }>;
  createdAt: string;
  readBy?: Array<{ userId: string; readAt: string }>;
}

export interface SessionEscalationRequest {
  _id: string;
  conversationId: string;
  topic: string;
  objective: string;
  urgency: 'low' | 'normal' | 'high';
  expectedHelpType: string;
  preferredSlots: string[];
  status: string;
  mentorResponse?: string;
  sessionId?: string;
  createdAt: string;
}
