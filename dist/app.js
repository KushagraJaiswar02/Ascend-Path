"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const errorHandler_1 = require("./middleware/errorHandler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const rateLimiter_1 = require("./middleware/rateLimiter");
const requestContext_1 = require("./middleware/requestContext");
const app = (0, express_1.default)();
// Security Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));
app.use(requestContext_1.requestContext);
// Apply Global Rate Limiter
app.use(rateLimiter_1.globalLimiter);
// Parsing Middleware
app.use(express_1.default.json({ limit: '10kb' })); // Limit payload size
app.use((0, cookie_parser_1.default)());
// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'AscendPath API is running' });
});
const user_routes_1 = require("./modules/users/user.routes");
const auth_routes_1 = require("./modules/auth/auth.routes");
const post_routes_1 = require("./modules/posts/post.routes");
const ping_routes_1 = require("./modules/pings/ping.routes");
const roadmap_routes_1 = require("./modules/roadmaps/roadmap.routes");
const session_routes_1 = require("./modules/sessions/session.routes");
const search_routes_1 = require("./modules/search/search.routes");
const notification_routes_1 = require("./modules/notifications/notification.routes");
const report_routes_1 = require("./modules/moderation/report.routes");
const guide_routes_1 = require("./modules/guides/guide.routes");
const review_routes_1 = require("./modules/reviews/review.routes");
const admin_routes_1 = require("./modules/admin/admin.routes");
const mentorApplication_routes_1 = require("./modules/mentor-applications/mentorApplication.routes");
const onboarding_routes_1 = require("./modules/onboarding/onboarding.routes");
// Register Module Routes Here
app.use('/api/v1/users', user_routes_1.userRoutes);
app.use('/api/v1/auth', auth_routes_1.authRoutes);
app.use('/api/v1/posts', post_routes_1.postRoutes);
app.use('/api/v1/pings', ping_routes_1.pingRoutes);
app.use('/api/v1/roadmaps', roadmap_routes_1.roadmapRoutes);
app.use('/api/v1/sections', roadmap_routes_1.sectionRoutes);
app.use('/api/v1/steps', roadmap_routes_1.stepRoutes);
app.use('/api/v1/me/roadmaps', roadmap_routes_1.meRoadmapRoutes);
app.use('/api/v1/sessions', session_routes_1.sessionRoutes);
app.use('/api/v1/search', search_routes_1.searchRoutes);
app.use('/api/v1/notifications', notification_routes_1.notificationRoutes);
app.use('/api/v1/moderation', report_routes_1.reportRoutes);
app.use('/api/v1/guides', guide_routes_1.guideRoutes);
app.use('/api/v1/reviews', review_routes_1.reviewRoutes);
app.use('/api/v1/mentor-applications', mentorApplication_routes_1.mentorApplicationRoutes);
app.use('/api/v1/onboarding', onboarding_routes_1.onboardingRoutes);
app.use('/api/v1/admin/mentor-applications', mentorApplication_routes_1.adminMentorApplicationRoutes);
app.use('/api/v1/admin', admin_routes_1.adminRoutes);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
// Bootstrap Notification Listeners
require("./modules/notifications/notification.listener");
require("./modules/mentor-applications/mentorApplication.events");
exports.default = app;
