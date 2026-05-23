import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalLimiter } from './middleware/rateLimiter';
import { requestContext } from './middleware/requestContext';

const app: Application = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

app.use(requestContext);

// Apply Global Rate Limiter
app.use(globalLimiter);

// Parsing Middleware
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(cookieParser());

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'AscendPath API is running' });
});

import { userRoutes } from './modules/users/user.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { postRoutes } from './modules/posts/post.routes';
import { pingRoutes } from './modules/pings/ping.routes';
import { roadmapRoutes, sectionRoutes, stepRoutes, meRoadmapRoutes } from './modules/roadmaps/roadmap.routes';
import { sessionRoutes } from './modules/sessions/session.routes';
import { searchRoutes } from './modules/search/search.routes';
import { notificationRoutes } from './modules/notifications/notification.routes';
import { reportRoutes } from './modules/moderation/report.routes';
import { guideRoutes } from './modules/guides/guide.routes';
import { reviewRoutes } from './modules/reviews/review.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { mentorApplicationRoutes, adminMentorApplicationRoutes } from './modules/mentor-applications/mentorApplication.routes';
import { onboardingRoutes } from './modules/onboarding/onboarding.routes';
import { sessionReflectionController } from './modules/sessions/sessionReflection.controller';
import { authMiddleware } from './middleware/auth.middleware';

// Register Module Routes Here
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/pings', pingRoutes);
app.use('/api/v1/roadmaps', roadmapRoutes);
app.use('/api/v1/sections', sectionRoutes);
app.use('/api/v1/steps', stepRoutes);
app.use('/api/v1/me/roadmaps', meRoadmapRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.get('/api/v1/me/reflections', authMiddleware, sessionReflectionController.getMyReflections);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/moderation', reportRoutes);
app.use('/api/v1/guides', guideRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/mentor-applications', mentorApplicationRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/admin/mentor-applications', adminMentorApplicationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Bootstrap Notification Listeners
import './modules/notifications/notification.listener';
import './modules/mentor-applications/mentorApplication.events';

export default app;
