"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
// Define user routes
router.post('/register', user_controller_1.userController.registerUser);
router.get('/guides', user_controller_1.userController.getGuides);
router.get('/:id', user_controller_1.userController.getUserById);
exports.userRoutes = router;
