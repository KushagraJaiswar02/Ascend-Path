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
};
