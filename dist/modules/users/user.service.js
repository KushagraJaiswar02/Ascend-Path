"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const user_repository_1 = require("./user.repository");
const user_model_1 = require("./user.model");
const logger_1 = require("../../utils/logger");
exports.userService = {
    async registerUser(data) {
        // 1. Check if user already exists
        const existingUser = await user_repository_1.userRepository.findUserByEmail(data.email);
        if (existingUser) {
            throw { statusCode: 400, message: 'User with this email already exists' };
        }
        // 2. Hash password (placeholder for actual bcrypt logic in later phase)
        const passwordHash = `hashed_${data.password}`;
        const parsedSkills = data.skills
            ? data.skills.map((skill) => typeof skill === 'string' ? { name: skill } : skill)
            : [];
        // 3. Create user with defaults
        const newUser = await user_repository_1.userRepository.createUser({
            name: data.name,
            email: data.email,
            passwordHash,
            role: user_model_1.Role.USER,
            educationLevel: data.educationLevel,
            bio: data.bio,
            domains: data.domains || [],
            skills: parsedSkills,
            interests: data.interests || [],
        });
        // 4. Return sanitized user (exclude passwordHash)
        const userObj = newUser.toObject();
        const { passwordHash: _, ...sanitizedUser } = userObj;
        return sanitizedUser;
    },
    async getUserById(userId) {
        const user = await user_repository_1.userRepository.findUserById(userId);
        if (!user) {
            throw { statusCode: 404, message: 'User not found' };
        }
        const userObj = user.toObject();
        const { passwordHash: _, ...sanitizedUser } = userObj;
        return sanitizedUser;
    },
    async evaluateUserRole(userId) {
        const user = await user_repository_1.userRepository.findUserById(userId);
        if (!user)
            return;
        // PATHFINDER auto-unlock threshold
        if (user.respectPoints >= 500 && [user_model_1.Role.USER, user_model_1.Role.EXPLORER].includes(user.role)) {
            await user_repository_1.userRepository.updateUser(userId, { role: user_model_1.Role.GUIDE });
            this.onRoleUpgrade(userId, user_model_1.Role.GUIDE);
        }
    },
    onRoleUpgrade(userId, newRole) {
        // Basic event-like logger for role upgrades
        logger_1.logger.info(`[EVENT] RoleUpgrade: User ${userId} unlocked ${newRole}`);
        // Future implementation: eventEmitter.emit('roleUpgrade', { userId, newRole })
    },
    async updateProfessionalProfile(userId, data) {
        // If username is being set, ensure it's unique
        if (data.username) {
            const existing = await user_model_1.User.findOne({ username: data.username, _id: { $ne: userId } }).lean();
            if (existing)
                throw { statusCode: 409, message: 'Username is already taken. Please choose another.' };
        }
        const updated = await user_model_1.User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true }).select('-passwordHash').lean();
        if (!updated)
            throw { statusCode: 404, message: 'User not found' };
        return updated;
    },
    async getPublicProfileByUsername(username) {
        const user = await user_model_1.User.findOne({ username, profileVisibility: true })
            .select('-passwordHash -email -falseReportStrikes -moderatorNotes -suspensionReason')
            .lean();
        if (!user)
            throw { statusCode: 404, message: 'Profile not found or not public' };
        return user;
    },
    async getPublicProfileById(userId) {
        const user = await user_model_1.User.findById(userId)
            .select('-passwordHash -email -falseReportStrikes -moderatorNotes -suspensionReason')
            .lean();
        if (!user)
            throw { statusCode: 404, message: 'User not found' };
        return user;
    },
};
