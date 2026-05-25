import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac';
import { recommendationController } from './recommendation.controller';

export const recommendationRoutes = Router();

recommendationRoutes.use(authMiddleware);
recommendationRoutes.get('/me', recommendationController.getMine);
recommendationRoutes.post('/interactions', recommendationController.recordInteraction);

export const adminRecommendationRoutes = Router();

adminRecommendationRoutes.use(authMiddleware);
adminRecommendationRoutes.get('/analytics', requirePermission('analytics:read'), recommendationController.analytics);
