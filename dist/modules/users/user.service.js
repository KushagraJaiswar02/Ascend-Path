"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const user_repository_1 = require("./user.repository");
const user_model_1 = require("./user.model");
exports.userService = {
    async registerUser(data) {
        // 1. Check if user already exists
        const existingUser = await user_repository_1.userRepository.findUserByEmail(data.email);
        if (existingUser) {
            throw { statusCode: 400, message: 'User with this email already exists' };
        }
        // 2. Hash password (placeholder for actual bcrypt logic in later phase)
        const passwordHash = `hashed_${data.password}`;
        // 3. Create user with defaults
        const newUser = await user_repository_1.userRepository.createUser({
            name: data.name,
            email: data.email,
            passwordHash,
            role: user_model_1.Role.EXPLORER,
            educationLevel: data.educationLevel,
            bio: data.bio,
            skills: data.skills || [],
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
};
