import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac';
import { companionController } from './companion.controller';

export const companionRoutes = Router();

companionRoutes.use(authMiddleware);
companionRoutes.get('/me', companionController.home);
companionRoutes.get('/me/timeline', companionController.timeline);
companionRoutes.post('/me/check-ins', companionController.submitCheckIn);
companionRoutes.post('/me/journal', companionController.createJournalEntry);
companionRoutes.get('/mentor/learners/:learnerId/summary', companionController.mentorSummary);

export const adminCompanionRoutes = Router();

adminCompanionRoutes.use(authMiddleware);
adminCompanionRoutes.get('/analytics', requirePermission('analytics:read'), companionController.analytics);
