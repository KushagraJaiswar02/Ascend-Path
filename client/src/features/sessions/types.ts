export interface Session {
  _id: string;
  guideId: { _id: string; name: string; avatar?: string };
  clientId?: { _id: string; name: string; avatar?: string };
  explorerId?: { _id: string; name: string; avatar?: string };
  sessionType?: 'private_mentorship' | 'public_workshop';
  title?: string;
  topic: string;
  description: string;
  domains?: string[];
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  scheduledAt: string;
  durationMinutes?: number;
  duration: number;
  price: number;
  status: 'open' | 'booked' | 'started' | 'active' | 'completed' | 'cancelled' | 'scheduled' | 'registration_open' | 'live' | 'ended' | 'archived';
  isPublic?: boolean;
  capacity?: number;
  attendeeCount?: number;
  bannerImage?: string;
  thumbnail?: string;
  roadmapId?: string;
  registrationMode?: 'open' | 'approval' | 'invite_only';
  sessionCategory?: 'workshop' | 'ama' | 'roadmap_walkthrough' | 'study_event' | 'community_teaching';
  resources?: { title: string; url: string; type?: string }[];
  recordingUrl?: string;
  attendees?: { userId: { _id: string; name: string; avatar?: string } | string; registeredAt: string; attendedAt?: string }[];
  waitlist?: { userId: { _id: string; name: string; avatar?: string } | string; joinedAt: string }[];
  meetingLink?: string;
  meetingProvider?: 'jitsi' | 'google_meet' | 'zoom' | 'daily' | 'livekit';
  meetingUrl?: string;
  meetingRoomId?: string;
  startedAt?: string;
  endedAt?: string;
  mentorJoinedAt?: string;
  menteeJoinedAt?: string;
  actualDurationMinutes?: number;
  attendanceStatus?: 'scheduled' | 'waiting' | 'active' | 'completed' | 'missed' | 'cancelled';
  sessionExecutionState?:
    | 'scheduled'
    | 'started'
    | 'participants_joined'
    | 'active'
    | 'ended'
    | 'reflection_unlocked';
  rating?: number;
  createdAt: string;
}

export interface SessionExecution {
  sessionId: string;
  guideId: string;
  clientId?: string;
  meetingProvider?: Session['meetingProvider'];
  meetingUrl?: string;
  meetingRoomId?: string;
  startedAt?: string;
  endedAt?: string;
  mentorJoinedAt?: string;
  menteeJoinedAt?: string;
  actualDurationMinutes: number;
  minimumDurationMinutes: number;
  attendanceStatus: NonNullable<Session['attendanceStatus']>;
  sessionExecutionState: NonNullable<Session['sessionExecutionState']>;
  participants: {
    mentorJoined: boolean;
    menteeJoined: boolean;
  };
  gates: {
    bothParticipantsJoined: boolean;
    durationGateMet: boolean;
    completionAvailable: boolean;
    reflectionUnlocked: boolean;
  };
}

export interface MentorRecommendation {
  roadmapId?: { _id: string; title: string; slug?: string; domains?: string[]; difficulty?: string } | string;
  stepId?: { _id: string; title: string; type?: string; estimatedMinutes?: number; difficulty?: string } | string;
  title: string;
  reason?: string;
}

export interface SessionReflection {
  _id: string;
  sessionId: Session | string;
  menteeId: { _id: string; name: string; avatar?: string; role?: string } | string;
  mentorId: { _id: string; name: string; avatar?: string; role?: string } | string;
  menteeReflection?: {
    learnings: string;
    confidenceLevel: number;
    nextChallenge: string;
    submittedAt?: string;
  };
  mentorFollowup?: {
    recommendedRoadmapSteps: MentorRecommendation[];
    recommendedResources: { title: string; url: string; type?: string }[];
    recommendedProjects: { title: string; description?: string; difficulty?: string }[];
    mentorNotes?: string;
    nextSessionSuggestion?: string;
    submittedAt?: string;
  };
  status: 'requested' | 'mentee_submitted' | 'followup_added' | 'completed';
  analyticsSignals?: {
    hasMenteeReflection: boolean;
    hasMentorFollowup: boolean;
    recommendedRoadmapStepCount: number;
    recommendedResourceCount: number;
    recommendedProjectCount: number;
  };
  createdAt: string;
  updatedAt: string;
}
