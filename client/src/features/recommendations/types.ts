export type RecommendationTarget = 'mentor' | 'roadmap' | 'session' | 'forum' | 'resource' | 'career_path';

export interface RecommendationItem<T = any> {
  targetType: RecommendationTarget;
  score: number;
  reasons: string[];
  contextLabel?: string;
  item: T;
}

export interface RecommendationRails {
  mentors: RecommendationItem[];
  roadmaps: RecommendationItem[];
  sessions: RecommendationItem[];
  forum: RecommendationItem[];
}

export interface RecommendationResponseV2 {
  contextLabel: string;
  rails: RecommendationRails;
  starterJourney: Array<{ title: string; description: string }>;
  profile?: unknown;
}
