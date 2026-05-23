import mongoose, { Document, Schema } from 'mongoose';

export enum Role {
  EXPLORER = 'explorer',
  PATHFINDER = 'pathfinder',
  GUIDE = 'guide',
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
  onboardingCompleted: boolean;
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
      default: Role.EXPLORER,
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
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// High-performance production indexes
userSchema.index({ role: 1, profileVisibility: 1 });
userSchema.index({ domains: 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ averageRating: -1 });
userSchema.index({ fameScore: -1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema);
