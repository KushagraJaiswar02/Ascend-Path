"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const user_model_1 = require("./user.model");
exports.userRepository = {
    async createUser(userData) {
        const user = new user_model_1.User(userData);
        return await user.save();
    },
    async findUserByEmail(email) {
        return await user_model_1.User.findOne({ email });
    },
    async findUserById(id) {
        return await user_model_1.User.findById(id);
    },
    async updateUser(id, updateData) {
        return await user_model_1.User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    },
    async incrementRespectPoints(id, points) {
        return await user_model_1.User.findByIdAndUpdate(id, { $inc: { respectPoints: points } }, { new: true });
    },
    async getGuides(filters, page, limit) {
        const skip = (page - 1) * limit;
        // Force role filter to GUIDE
        const queryFilters = {
            ...filters,
            $or: [
                { role: user_model_1.Role.GUIDE },
                { roles: user_model_1.Role.GUIDE },
                { capabilities: 'discover:listed' },
            ],
            mentorProfileStatus: 'approved',
            profileVisibility: true,
            isBanned: false,
        };
        const guides = await user_model_1.User.find(queryFilters)
            .select('-passwordHash')
            .skip(skip)
            .limit(limit)
            .sort({ fameScore: -1 });
        const total = await user_model_1.User.countDocuments(queryFilters);
        return {
            guides,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalGuides: total,
        };
    },
    async countUsers() {
        return await user_model_1.User.countDocuments();
    },
};
