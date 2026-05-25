import type { PortfolioProject, VerifiedAchievement } from '../credibility/api/credibility.api';

export type OpportunityType =
  | 'internship'
  | 'job'
  | 'freelance'
  | 'scholarship'
  | 'competition'
  | 'exam'
  | 'university'
  | 'bootcamp'
  | 'fellowship';

export type RemoteStatus = 'remote' | 'hybrid' | 'onsite';

export interface Opportunity {
  _id: string;
  title: string;
  slug: string;
  opportunityType: OpportunityType;
  organizationName: string;
  organizationLogo?: string;
  domains: string[];
  careerDomains: { _id: string; name: string; slug: string }[];
  careerGoals: { _id: string; name: string; slug: string }[];
  requiredSkills: string[];
  preferredSkills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  eligibilityCriteria?: string;
  location?: string;
  remoteStatus: RemoteStatus;
  stipend?: string;
  salaryRange?: string;
  applicationDeadline: string;
  applicationLink: string;
  readinessSignals: string[];
  recommendedRoadmaps: { _id: string; title: string; slug: string }[];
  verificationStatus: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  creatorId: string;
  readinessScore?: number;
  readinessGaps?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'applied'
  | 'shortlisted'
  | 'interviewing'
  | 'rejected'
  | 'accepted'
  | 'archived';

export interface ApplicationReminder {
  date: string;
  note: string;
  sent: boolean;
}

export interface Application {
  _id: string;
  userId: string;
  opportunityId: Opportunity;
  status: ApplicationStatus;
  notes?: string;
  reminders: ApplicationReminder[];
  mentorGuidance?: string;
  interviewReflections?: string;
  connectedProjects?: PortfolioProject[];
  connectedAchievements?: VerifiedAchievement[];
  createdAt: string;
  updatedAt: string;
}
