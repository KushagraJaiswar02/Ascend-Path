export interface CompanionProfile {
  confidenceTrend?: {
    current?: number;
    previous?: number;
    direction: 'rising' | 'falling' | 'steady' | 'unknown';
  };
  learningPatterns?: {
    consistencyScore: number;
    lastActiveAt?: string;
  };
  momentum?: {
    score: number;
    status: 'building' | 'steady' | 'stalled' | 'recovering' | 'unknown';
    streakCount: number;
  };
  blockers: Array<{
    type: string;
    label: string;
    severity: 'low' | 'medium' | 'high';
    evidence: string[];
    resolvedAt?: string;
  }>;
  milestones: Array<{ title: string; category: string; occurredAt: string }>;
  reflectionSummaries?: {
    recurringInterests: string[];
    recurringStruggles: string[];
    evolvingGoals: string[];
    uncertaintyThemes: string[];
  };
}

export interface CompanionHome {
  profile: CompanionProfile;
  adaptiveGuidance: {
    tone: 'recovery' | 'supportive' | 'growth' | 'steady';
    title: string;
    message: string;
    nextActions: string[];
  };
  timeline: Array<{ _id: string; type: string; title: string; summary?: string; occurredAt: string }>;
  journal: Array<{ _id: string; entryType: string; title: string; body: string; mood?: string; createdAt: string }>;
  checkIns: Array<{ _id: string; confidenceLevel: number; hardestThing?: string; createdAt: string }>;
}
