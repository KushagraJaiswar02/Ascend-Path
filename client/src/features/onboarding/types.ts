export type PrimaryGoal =
  | 'land_first_job'
  | 'switch_domains'
  | 'improve_current_skills'
  | 'prepare_for_interviews'
  | 'find_mentor_guidance'
  | 'build_projects'
  | 'become_a_mentor';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface OnboardingPayload {
  primaryGoal: PrimaryGoal;
  experienceLevel: ExperienceLevel;
  targetRole: string;
  interestedDomains: string[];
  preferredLearningStyle?: 'roadmaps' | 'mentor_sessions' | 'projects' | 'forum_discussion' | 'mixed';
  weeklyCommitmentHours?: number;
}

export interface RecommendationResponse {
  onboardingCompleted: boolean;
  personalization: {
    headline: string;
    subheading: string;
    primaryAction: string;
  };
  preferences?: OnboardingPayload;
  roadmaps: Array<{ item: RecommendedRoadmap; score: number; reason: string }>;
  fallbackRoadmaps: Array<{ title: string; domain: string; difficulty: string; reason: string; priority: number }>;
  mentors: Array<{ item: RecommendedMentor; score: number; reason: string }>;
  posts: Array<{ item: RecommendedPost; score: number; reason: string }>;
  quickActions: Array<{ label: string; href: string; priority: number }>;
}

export interface RecommendedRoadmap {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  domains?: string[];
  domain?: string;
}

export interface RecommendedMentor {
  _id: string;
  name: string;
  avatar?: string;
  domains?: string[];
}

export interface RecommendedPost {
  _id: string;
  title: string;
  tags?: string[];
}
