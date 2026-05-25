import { Router } from 'express';
import { taxonomyController } from './taxonomy.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac';

export const taxonomyRoutes = Router();

taxonomyRoutes.get('/clusters', taxonomyController.listClusters);
taxonomyRoutes.get('/domains', taxonomyController.listDomains);
taxonomyRoutes.get('/goals', taxonomyController.listGoals);
taxonomyRoutes.get('/explorer', taxonomyController.explorer);
taxonomyRoutes.get('/resolve-domain', taxonomyController.resolveDomain);

export const adminTaxonomyRoutes = Router();

adminTaxonomyRoutes.use(authMiddleware);
adminTaxonomyRoutes.post('/clusters', requirePermission('taxonomy:manage'), taxonomyController.createCluster);
adminTaxonomyRoutes.patch('/clusters/:id', requirePermission('taxonomy:manage'), taxonomyController.updateCluster);
adminTaxonomyRoutes.post('/domains', requirePermission('taxonomy:manage'), taxonomyController.createDomain);
adminTaxonomyRoutes.patch('/domains/:id', requirePermission('taxonomy:manage'), taxonomyController.updateDomain);
adminTaxonomyRoutes.post('/goals', requirePermission('taxonomy:manage'), taxonomyController.createGoal);
adminTaxonomyRoutes.patch('/goals/:id', requirePermission('taxonomy:manage'), taxonomyController.updateGoal);
