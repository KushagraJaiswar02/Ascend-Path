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

export enum CareerStage {
  SCHOOL_STUDENT = 'school_student',
  COLLEGE_STUDENT = 'college_student',
  GRADUATE = 'graduate',
  WORKING_PROFESSIONAL = 'working_professional',
  CAREER_SWITCHER = 'career_switcher',
  EXAM_ASPIRANT = 'exam_aspirant',
  FREELANCER = 'freelancer',
  VOCATIONAL_LEARNER = 'vocational_learner',
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
  careerDomains: mongoose.Types.ObjectId[];
  careerGoals: mongoose.Types.ObjectId[];
  careerStage?: CareerStage;
  weeklyCommitment?: string;
  budgetRange?: string;
  preferredLanguages: string[];
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
  username?: string;
  headline?: string;
  specialization?: string;
  portfolioLinks?: { label: string; url: string }[];
  onboarding?: {
    primaryGoal?: string;
    careerGoals: mongoose.Types.ObjectId[];
    experienceLevel?: string;
    careerStage?: CareerStage;
    targetRole?: string;
    interestedDomains: string[];
    careerDomains: mongoose.Types.ObjectId[];
    preferredLearningStyle?: string;
    mentorshipPreference?: string;
    directionClarity?: string;
    weeklyCommitment?: string;
    weeklyCommitmentHours?: number;
    budgetRange?: string;
    preferredLanguages: string[];
  };
  mentorProfile?: {
    specializations: string[];
    industries: string[];
    languages: string[];
    experienceYears?: number;
    educationBackground?: string;
    certifications: string[];
    mentorshipFocus: mongoose.Types.ObjectId[];
    examExpertise: string[];
    menteeOutcomes?: string[];
    roadmapImpact?: number;
    sessionQuality?: number;
    completionRate?: number;
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
    careerDomains: { type: [Schema.Types.ObjectId], ref: 'CareerDomain', default: [], index: true },
    careerGoals: { type: [Schema.Types.ObjectId], ref: 'CareerGoal', default: [], index: true },
    careerStage: { type: String, enum: Object.values(CareerStage) },
    weeklyCommitment: { type: String, trim: true },
    budgetRange: { type: String, trim: true },
    preferredLanguages: { type: [String], default: [] },
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
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    headline: { type: String, trim: true },
    specialization: { type: String, trim: true },
    portfolioLinks: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      }
    ],
    onboarding: {
      primaryGoal: { type: String, trim: true },
      careerGoals: { type: [Schema.Types.ObjectId], ref: 'CareerGoal', default: [] },
      experienceLevel: { type: String, trim: true },
      careerStage: { type: String, enum: Object.values(CareerStage) },
      targetRole: { type: String, trim: true },
      interestedDomains: { type: [String], default: [] },
      careerDomains: { type: [Schema.Types.ObjectId], ref: 'CareerDomain', default: [] },
      preferredLearningStyle: { type: String, trim: true },
      mentorshipPreference: { type: String, trim: true },
      directionClarity: { type: String, trim: true },
      weeklyCommitment: { type: String, trim: true },
      weeklyCommitmentHours: { type: Number, min: 1, max: 80 },
      budgetRange: { type: String, trim: true },
      preferredLanguages: { type: [String], default: [] },
    },
    mentorProfile: {
      specializations: { type: [String], default: [] },
      industries: { type: [String], default: [] },
      languages: { type: [String], default: [] },
      experienceYears: { type: Number, min: 0, max: 80 },
      educationBackground: { type: String, trim: true },
      certifications: { type: [String], default: [] },
      mentorshipFocus: { type: [Schema.Types.ObjectId], ref: 'CareerGoal', default: [] },
      examExpertise: { type: [String], default: [] },
      menteeOutcomes: { type: [String], default: [] },
      roadmapImpact: { type: Number, default: 0 },
      sessionQuality: { type: Number, default: 5 },
      completionRate: { type: Number, default: 100 },
    },
  },
  { timestamps: true }
);

// High-performance production indexes
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1, profileVisibility: 1 });
userSchema.index({ roles: 1, profileVisibility: 1 });
userSchema.index({ capabilities: 1, mentorProfileStatus: 1 });
userSchema.index({ isBanned: 1, suspendedUntil: 1 });
userSchema.index({ domains: 1 });
userSchema.index({ careerDomains: 1, careerStage: 1 });
userSchema.index({ careerGoals: 1, careerStage: 1 });
userSchema.index({ preferredLanguages: 1, budgetRange: 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ averageRating: -1 });
userSchema.index({ fameScore: -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ onboardingCompleted: 1, 'onboarding.interestedDomains': 1 });
userSchema.index({ onboardingCompleted: 1, 'onboarding.careerDomains': 1 });
userSchema.index({ onboardingCompleted: 1, 'onboarding.careerGoals': 1 });
userSchema.index({ 'onboarding.targetRole': 1, 'onboarding.experienceLevel': 1 });

export const User = mongoose.model<IUser>('User', userSchema);
