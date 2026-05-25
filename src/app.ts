import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalLimiter } from './middleware/rateLimiter';
import { requestContext } from './middleware/requestContext';

const app: Application = express();

// ── Trust Proxy (required on Render / Railway / Heroku) ───────────────────────
// Render sits behind a reverse proxy. Without this, req.secure is always false
// which breaks secure cookie detection and rate limiter IP resolution.
app.set('trust proxy', 1);

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
// withCredentials requests require an explicit origin, never '*'.
// We whitelist both the configured CLIENT_URL (Vercel) and localhost dev ports.
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
import { adminTaxonomyRoutes, taxonomyRoutes } from './modules/taxonomy/taxonomy.routes';
import { adminRecommendationRoutes, recommendationRoutes } from './modules/recommendations/recommendation.routes';
import { adminPathwayRoutes, pathwayRoutes } from './modules/pathways/pathway.routes';
import { adminCompanionRoutes, companionRoutes } from './modules/companion/companion.routes';
import { opportunityRoutes, adminOpportunityRoutes } from './modules/opportunities/opportunity.routes';
import { portfolioRoutes } from './modules/portfolio/portfolio.routes';
import { achievementRoutes } from './modules/achievements/achievement.routes';
import { endorsementRoutes } from './modules/endorsements/endorsement.routes';
import { mentorshipRoutes } from './modules/mentorship/mentorship.routes';
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
app.use('/api/v1/taxonomy', taxonomyRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/pathways', pathwayRoutes);
app.use('/api/v1/companion', companionRoutes);
app.use('/api/v1/opportunities', opportunityRoutes);
app.use('/api/v1/mentorship', mentorshipRoutes);
app.use('/api/v1/admin/opportunities', adminOpportunityRoutes);
app.use('/api/v1/admin/mentor-applications', adminMentorApplicationRoutes);
app.use('/api/v1/admin/taxonomy', adminTaxonomyRoutes);
app.use('/api/v1/admin/recommendations', adminRecommendationRoutes);
app.use('/api/v1/admin/pathways', adminPathwayRoutes);
app.use('/api/v1/admin/companion', adminCompanionRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/v1/endorsements', endorsementRoutes);

// Global Error Handler
app.use(errorHandler);

// Bootstrap Notification Listeners
import './modules/notifications/notification.listener';
import './modules/mentor-applications/mentorApplication.events';
import './modules/mentorship/mentorship.events';
import './modules/companion/careerCompanion.service';
import './modules/achievements/achievement.listener';

export default app;
