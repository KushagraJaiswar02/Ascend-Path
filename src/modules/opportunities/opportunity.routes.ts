import { Router } from 'express';
import { opportunityController } from './opportunity.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac';

export const opportunityRoutes = Router();

// Secure all opportunity routes
opportunityRoutes.use(authMiddleware);

// Student/Mentor Discovery & Application Paths
opportunityRoutes.get('/', opportunityController.listOpportunities);
opportunityRoutes.post('/', opportunityController.createOpportunity);
opportunityRoutes.get('/me/applications', opportunityController.getMyApplicationsBoard);
opportunityRoutes.get('/:id', opportunityController.getOpportunity);
opportunityRoutes.post('/:id/apply', opportunityController.applyToOpportunity);
opportunityRoutes.put('/applications/:appId', opportunityController.updateApplication);
opportunityRoutes.post('/applications/:appId/reminders', opportunityController.addReminder);

export const adminOpportunityRoutes = Router();

adminOpportunityRoutes.use(authMiddleware);
// Verify permissions check
adminOpportunityRoutes.get('/', requirePermission('content:moderate'), opportunityController.listAdminOpportunities);
adminOpportunityRoutes.put('/:id/verify', requirePermission('content:moderate'), opportunityController.verifyOpportunity);
