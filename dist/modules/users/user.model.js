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
exports.User = exports.EducationLevel = exports.Role = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var Role;
(function (Role) {
    Role["EXPLORER"] = "explorer";
    Role["PATHFINDER"] = "pathfinder";
    Role["GUIDE"] = "guide";
    Role["SENTINEL"] = "sentinel";
    Role["ARCHITECT"] = "architect";
})(Role || (exports.Role = Role = {}));
var EducationLevel;
(function (EducationLevel) {
    EducationLevel["SCHOOL"] = "school";
    EducationLevel["COLLEGE"] = "college";
    EducationLevel["PROFESSIONAL"] = "professional";
})(EducationLevel || (exports.EducationLevel = EducationLevel = {}));
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
        default: Role.EXPLORER,
    },
    respectPoints: { type: Number, default: 0 },
    fameScore: { type: Number, default: 0 },
    educationLevel: {
        type: String,
        enum: Object.values(EducationLevel),
    },
    bio: { type: String },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    pingAvailable: { type: Boolean, default: true },
    oauthProvider: { type: String },
}, { timestamps: true });
exports.User = mongoose_1.default.model('User', userSchema);
