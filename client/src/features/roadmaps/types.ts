export interface RoadmapCommunityLearner {
  userId: string;
  name: string;
  avatar?: string | null;
  role?: string;
  progressPercentage?: number;
  lastActiveAt?: string;
  anonymous?: boolean;
}

export interface RoadmapCommunity {
  roadmapId: string;
  activeWindowDays: number;
  enrollmentCount: number;
  activeLearnerCount: number;
  completionCount: number;
  completionsThisWeek: number;
  weeklyParticipationGrowth: number;
  previousWeeklyParticipationGrowth: number;
  momentum: {
    direction: 'up' | 'down' | 'steady';
    percentage: number;
  };
  activeLearners: RoadmapCommunityLearner[];
  signals: {
    activeLearnerLabel: string;
    completionLabel: string;
  };
}

export interface TrendingRoadmapSignal {
  roadmapId: string;
  roadmap: {
    _id: string;
    title: string;
    slug: string;
    domains?: string[];
    difficulty?: string;
    enrollmentCount?: number;
    thumbnail?: string;
  };
  currentGrowth: number;
  previousGrowth: number;
  activeLearners: number;
  completionsThisWeek: number;
  momentumScore: number;
}

export interface RoadmapMomentumItem {
  roadmap: {
    _id: string;
    title: string;
    slug: string;
  };
  progressPercentage: number;
  lastActiveAt: string;
  community: RoadmapCommunity;
}
