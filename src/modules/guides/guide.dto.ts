import { IUser, ISkill } from '../users/user.model';

export interface ISanitizedPublicGuide {
  _id: string;
  name: string;
  role: string;
  respectPoints: number;
  fameScore: number;
  guideRank: string;
  educationLevel?: string;
  bio?: string;
  domains: string[];
  skills: ISkill[];
  interests: string[];
  avatar?: string;
  isVerified: boolean;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  availability?: {
    text: string;
    schedule: { day: string; slots: string[] }[];
  };
  totalSessions: number;
  averageRating: number;
  totalReviews: number;
  profileVisibility: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
}

/**
 * Sanitizes a Mongoose User document or plain object to safely expose public Guide details.
 * Explicitly excludes email, passwordHash, isBanned, mutedUntil, internal markers, and tokens.
 */
export function sanitizePublicGuide(user: any): ISanitizedPublicGuide {
  // Support both Mongoose document and plain JSON
  const rawUser = typeof user.toObject === 'function' ? user.toObject() : user;

  return {
    _id: rawUser._id.toString(),
    name: rawUser.name,
    role: rawUser.role,
    respectPoints: rawUser.respectPoints || 0,
    fameScore: rawUser.fameScore || 0,
    guideRank: rawUser.guideRank,
    educationLevel: rawUser.educationLevel,
    bio: rawUser.bio,
    domains: rawUser.domains || [],
    skills: rawUser.skills || [],
    interests: rawUser.interests || [],
    avatar: rawUser.avatar,
    isVerified: !!rawUser.isVerified,
    socialLinks: rawUser.socialLinks,
    availability: rawUser.availability,
    totalSessions: rawUser.totalSessions || 0,
    averageRating: rawUser.averageRating || 0,
    totalReviews: rawUser.totalReviews || 0,
    profileVisibility: !!rawUser.profileVisibility,
    onboardingCompleted: !!rawUser.onboardingCompleted,
    createdAt: rawUser.createdAt,
  };
}
