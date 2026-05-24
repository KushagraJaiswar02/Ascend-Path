import mongoose, { Document, Schema } from 'mongoose';

export enum Role {
  USER = 'user',
  EXPLORER = 'explorer',
  PATHFINDER = 'pathfinder',
  GUIDE = 'guide',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  SENTINEL = 'sentinel',
  ARCHITECT = 'architect',
}

export enum EducationLevel {
  SCHOOL = 'school',
  COLLEGE = 'college',
  PROFESSIONAL = 'professional',
}

export enum GuideRank {
  RISING = 'Rising Guide',
  ESTABLISHED = 'Established Guide',
  EXPERT = 'Expert Guide',
}

export interface ISkill {
  name: string;
  level?: string;
  years?: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  roles: Role[];
  capabilities: string[];
  mentorProfileStatus?: string;
  respectPoints: number;
  fameScore: number;
  guideRank: GuideRank;
  educationLevel?: EducationLevel;
  bio?: string;
  domains: string[];
  skills: ISkill[];
  interests: string[];
  avatar?: string;
  isVerified: boolean;
  isBanned: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  suspensionSource?: string;
  suspendedUntil?: Date;
  falseReportStrikes: number;
  moderatorNotes?: string;
  mutedUntil?: Date;
  pingAvailable: boolean;
  oauthProvider?: string;
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
  showRoadmapActivity: boolean;
  anonymousRoadmapParticipation: boolean;
  onboardingCompleted: boolean;
  onboarding?: {
    primaryGoal?: string;
    experienceLevel?: string;
    targetRole?: string;
    interestedDomains: string[];
    preferredLearningStyle?: string;
    weeklyCommitmentHours?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    roles: {
      type: [String],
      enum: Object.values(Role),
      default: [Role.USER],
    },
    capabilities: { type: [String], default: [] },
    mentorProfileStatus: {
      type: String,
      enum: ['none', 'pending', 'under_review', 'approved', 'rejected', 'changes_requested'],
      default: 'none',
    },
    respectPoints: { type: Number, default: 0 },
    fameScore: { type: Number, default: 0 },
    guideRank: {
      type: String,
      enum: Object.values(GuideRank),
      default: GuideRank.RISING,
    },
    educationLevel: {
      type: String,
      enum: Object.values(EducationLevel),
    },
    bio: { type: String },
    domains: { type: [String], default: [] },
    skills: [
      {
        name: { type: String, required: true },
        level: { type: String },
        years: { type: Number },
      }
    ],
    interests: { type: [String], default: [] },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String },
    suspensionSource: { type: String },
    suspendedUntil: { type: Date },
    falseReportStrikes: { type: Number, default: 0 },
    moderatorNotes: { type: String },
    mutedUntil: { type: Date },
    pingAvailable: { type: Boolean, default: true },
    oauthProvider: { type: String },
    socialLinks: {
      github: { type: String },
      linkedin: { type: String },
      website: { type: String },
    },
    availability: {
      text: { type: String, default: 'Available for bookings' },
      schedule: [
        {
          day: { type: String, required: true },
          slots: { type: [String], default: [] },
        }
      ]
    },
    totalSessions: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    profileVisibility: { type: Boolean, default: true },
    showRoadmapActivity: { type: Boolean, default: true },
    anonymousRoadmapParticipation: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    onboarding: {
      primaryGoal: { type: String, trim: true },
      experienceLevel: { type: String, trim: true },
      targetRole: { type: String, trim: true },
      interestedDomains: { type: [String], default: [] },
      preferredLearningStyle: { type: String, trim: true },
      weeklyCommitmentHours: { type: Number, min: 1, max: 80 },
    },
  },
  { timestamps: true }
);

// High-performance production indexes
userSchema.index({ role: 1, profileVisibility: 1 });
userSchema.index({ roles: 1, profileVisibility: 1 });
userSchema.index({ capabilities: 1, mentorProfileStatus: 1 });
userSchema.index({ isBanned: 1, suspendedUntil: 1 });
userSchema.index({ domains: 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ averageRating: -1 });
userSchema.index({ fameScore: -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ onboardingCompleted: 1, 'onboarding.interestedDomains': 1 });
userSchema.index({ 'onboarding.targetRole': 1, 'onboarding.experienceLevel': 1 });

export const User = mongoose.model<IUser>('User', userSchema);
