import type { RecommendationResponseV2 } from '../recommendations/types';

export type PrimaryGoal =
  | 'land_first_job'
  | 'switch_domains'
  | 'improve_current_skills'
  | 'prepare_for_interviews'
  | 'find_mentor_guidance'
  | 'build_projects'
  | 'become_a_mentor';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type CareerStage =
  | 'school_student'
  | 'college_student'
  | 'graduate'
  | 'working_professional'
  | 'career_switcher'
  | 'exam_aspirant'
  | 'freelancer'
  | 'vocational_learner';

export type WeeklyCommitment = '0_3_hours' | '4_7_hours' | '8_15_hours' | '16_plus_hours';
export type BudgetRange = 'free_only' | 'low_cost' | 'moderate' | 'premium' | 'flexible';
export type DirectionClarity = 'unsure' | 'exploring' | 'somewhat_clear' | 'highly_focused';

export interface OnboardingPayload {
  primaryGoal?: PrimaryGoal | string;
  careerGoals: string[];
  experienceLevel?: ExperienceLevel;
  careerStage: CareerStage;
  targetRole?: string;
  interestedDomains: string[];
  careerDomains: string[];
  preferredLearningStyle?: 'roadmaps' | 'mentor_sessions' | 'projects' | 'forum_discussion' | 'mixed';
  mentorshipPreference?: 'mentor_guided' | 'occasional_checkins' | 'peer_community' | 'self_paced';
  directionClarity?: DirectionClarity;
  weeklyCommitment?: WeeklyCommitment;
  weeklyCommitmentHours?: number;
  budgetRange?: BudgetRange;
  preferredLanguages: string[];
}

export interface DashboardExperiencePayload {
  onboardingRequired: boolean;
  personalizationReady: boolean;
  level: 0 | 1 | 2 | 3 | 4;
  label: 'Onboarding' | 'Starter' | 'Active Learner' | 'Advanced Explorer' | 'Career Builder';
  mode: 'onboarding' | 'starter' | 'active_learner' | 'advanced_explorer' | 'career_builder';
  exposedFeatures: string[];
  hiddenFeatures: string[];
  reasoning: string[];
  progressSignals: {
    onboardingCompleted: boolean;
    confidence: DirectionClarity | string;
    hasCareerDomains: boolean;
    hasCareerGoals: boolean;
    hasMentorActivity: boolean;
    engagementScore: number;
  };
}

export interface RecommendationResponse {
  contextLabel?: string;
  rails?: RecommendationResponseV2['rails'];
  starterJourney?: RecommendationResponseV2['starterJourney'];
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
