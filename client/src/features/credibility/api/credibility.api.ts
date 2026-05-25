import { apiClient } from '@/services/apiClient';

export interface PortfolioProject {
  _id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  githubLink?: string;
  demoLink?: string;
  technologies: string[];
  domains: string[];
  roadmapId?: string;
  isMentorReviewed: boolean;
  reviewedBy?: string;
  mentorReviewNotes?: string;
  projectReflections: string;
  learningOutcomes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VerifiedAchievement {
  _id: string;
  userId: string;
  type: 'certificate' | 'badge';
  category: 'roadmap_completion' | 'workshop_participation' | 'mentorship_milestone' | 'learning_streak' | 'specialization';
  title: string;
  description: string;
  issuedAt: string;
  credentialId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Endorsement {
  _id: string;
  endorserId: {
    _id: string;
    name: string;
    avatar?: string;
    headline?: string;
    role: string;
  };
  recipientId: string;
  type: 'skill' | 'roadmap' | 'project' | 'general';
  skillName?: string;
  roadmapId?: string;
  projectId?: string;
  message: string;
  moderationStatus: 'approved' | 'flagged' | 'hidden';
  createdAt: string;
}

export interface PublicProfile {
  _id: string;
  name: string;
  username?: string;
  headline?: string;
  specialization?: string;
  bio?: string;
  avatar?: string;
  role: string;
  domains: string[];
  skills: { name: string; level?: string }[];
  portfolioLinks?: { label: string; url: string }[];
  socialLinks?: { github?: string; linkedin?: string; website?: string };
  fameScore: number;
  respectPoints: number;
  totalSessions: number;
  averageRating: number;
  mentorProfile?: {
    specializations: string[];
    completionRate?: number;
    roadmapImpact?: number;
    sessionQuality?: number;
    menteeOutcomes?: string[];
  };
  createdAt: string;
}

export const credibilityApi = {
  // Portfolio
  getPortfolioProjects: async (userId: string): Promise<PortfolioProject[]> => {
    const { data } = await apiClient.get(`/portfolio/user/${userId}`);
    return data.data.projects;
  },

  createPortfolioProject: async (projectData: Partial<PortfolioProject>): Promise<PortfolioProject> => {
    const { data } = await apiClient.post('/portfolio', projectData);
    return data.data.project;
  },

  updatePortfolioProject: async (id: string, projectData: Partial<PortfolioProject>): Promise<PortfolioProject> => {
    const { data } = await apiClient.patch(`/portfolio/${id}`, projectData);
    return data.data.project;
  },

  deletePortfolioProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/portfolio/${id}`);
  },

  // Achievements
  getAchievements: async (userId: string): Promise<VerifiedAchievement[]> => {
    const { data } = await apiClient.get(`/achievements/user/${userId}`);
    return data.data.achievements;
  },

  verifyCredential: async (credentialId: string): Promise<VerifiedAchievement> => {
    const { data } = await apiClient.get(`/achievements/verify/${credentialId}`);
    return data.data.achievement;
  },

  // Endorsements
  getEndorsements: async (userId: string): Promise<Endorsement[]> => {
    const { data } = await apiClient.get(`/endorsements/user/${userId}`);
    return data.data.endorsements;
  },

  createEndorsement: async (endorsementData: {
    recipientId: string;
    type: string;
    message: string;
    skillName?: string;
  }): Promise<Endorsement> => {
    const { data } = await apiClient.post('/endorsements', endorsementData);
    return data.data.endorsement;
  },

  // Public Profile
  getPublicProfileByUsername: async (username: string): Promise<PublicProfile> => {
    const { data } = await apiClient.get(`/users/username/${username}`);
    return data.data.user;
  },

  getPublicProfileById: async (userId: string): Promise<PublicProfile> => {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data.data.user;
  },

  // Professional profile updates
  updateProfessionalProfile: async (profileData: {
    username?: string;
    headline?: string;
    specialization?: string;
    portfolioLinks?: { label: string; url: string }[];
  }): Promise<PublicProfile> => {
    const { data } = await apiClient.patch('/users/me/professional', profileData);
    return data.data.user;
  },
};
