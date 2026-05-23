"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.GuideRank = exports.EducationLevel = exports.Role = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var Role;
(function (Role) {
    Role["USER"] = "user";
    Role["EXPLORER"] = "explorer";
    Role["PATHFINDER"] = "pathfinder";
    Role["GUIDE"] = "guide";
    Role["MODERATOR"] = "moderator";
    Role["ADMIN"] = "admin";
    Role["SUPER_ADMIN"] = "super_admin";
    Role["SENTINEL"] = "sentinel";
    Role["ARCHITECT"] = "architect";
})(Role || (exports.Role = Role = {}));
var EducationLevel;
(function (EducationLevel) {
    EducationLevel["SCHOOL"] = "school";
    EducationLevel["COLLEGE"] = "college";
    EducationLevel["PROFESSIONAL"] = "professional";
})(EducationLevel || (exports.EducationLevel = EducationLevel = {}));
var GuideRank;
(function (GuideRank) {
    GuideRank["RISING"] = "Rising Guide";
    GuideRank["ESTABLISHED"] = "Established Guide";
    GuideRank["EXPERT"] = "Expert Guide";
})(GuideRank || (exports.GuideRank = GuideRank = {}));
const userSchema = new mongoose_1.Schema({
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
        index: true,
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
    suspendedUntil: { type: Date },
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
}, { timestamps: true });
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
exports.User = mongoose_1.default.model('User', userSchema);
