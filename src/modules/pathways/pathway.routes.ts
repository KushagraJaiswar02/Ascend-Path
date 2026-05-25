import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac';
import { pathwayController } from './pathway.controller';

export const pathwayRoutes = Router();

pathwayRoutes.get('/domains/:slug', pathwayController.domainHub);
pathwayRoutes.get('/me/journey', authMiddleware, pathwayController.myJourney);

export const adminPathwayRoutes = Router();

adminPathwayRoutes.use(authMiddleware);
adminPathwayRoutes.post('/connections', requirePermission('taxonomy:manage'), pathwayController.createConnection);
adminPathwayRoutes.patch('/connections/:id', requirePermission('taxonomy:manage'), pathwayController.updateConnection);
