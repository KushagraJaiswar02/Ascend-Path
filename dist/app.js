"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Global Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'AscendPath API is running' });
});
// Import Routes
const user_routes_1 = require("./modules/users/user.routes");
// Register Module Routes Here
app.use('/api/v1/users', user_routes_1.userRoutes);
// app.use('/api/v1/auth', authRoutes);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
