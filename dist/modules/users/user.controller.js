"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_service_1 = require("./user.service");
const user_repository_1 = require("./user.repository");
const user_validation_1 = require("./user.validation");
exports.userController = {
    async registerUser(req, res, next) {
        try {
            // 1. Validate request body
            const validatedData = user_validation_1.registerUserSchema.parse({ body: req.body });
            // 2. Call service layer
            const user = await user_service_1.userService.registerUser(validatedData.body);
            // 3. Send response
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getUserById(req, res, next) {
        try {
            const id = req.params.id;
            const user = await user_service_1.userService.getUserById(id);
            res.status(200).json({ success: true, data: { user } });
        }
        catch (error) {
            next(error);
        }
    },
    async getGuides(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await user_repository_1.userRepository.getGuides({}, page, limit);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    async updateProfessionalProfile(req, res, next) {
        try {
            const userId = req.user._id.toString();
            const user = await user_service_1.userService.updateProfessionalProfile(userId, req.body);
            res.status(200).json({ success: true, data: { user } });
        }
        catch (error) {
            next(error);
        }
    },
    async getPublicProfileByUsername(req, res, next) {
        try {
            const { username } = req.params;
            const user = await user_service_1.userService.getPublicProfileByUsername(username);
            res.status(200).json({ success: true, data: { user } });
        }
        catch (error) {
            next(error);
        }
    },
    async getMyProfile(req, res, next) {
        try {
            const userId = req.user._id.toString();
            const user = await user_service_1.userService.getPublicProfileById(userId);
            res.status(200).json({ success: true, data: { user } });
        }
        catch (error) {
            next(error);
        }
    },
};
