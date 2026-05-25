"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', user_controller_1.userController.registerUser);
router.get('/guides', user_controller_1.userController.getGuides);
router.get('/username/:username', user_controller_1.userController.getPublicProfileByUsername);
router.get('/:id', user_controller_1.userController.getUserById);
// Authenticated routes
router.get('/me/profile', auth_middleware_1.authMiddleware, user_controller_1.userController.getMyProfile);
router.patch('/me/professional', auth_middleware_1.authMiddleware, user_controller_1.userController.updateProfessionalProfile);
exports.userRoutes = router;
