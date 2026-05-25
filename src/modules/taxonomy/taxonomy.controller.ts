import { NextFunction, Request, Response } from 'express';
import { taxonomyService } from './taxonomy.service';
import {
  resolveDomainSchema,
  taxonomyListQuerySchema,
  upsertClusterSchema,
  upsertDomainSchema,
  upsertGoalSchema,
  updateClusterSchema,
  updateDomainSchema,
  updateGoalSchema,
} from './taxonomy.validation';

const includeInactive = (value?: string) => value === 'true';

export const taxonomyController = {
  async listClusters(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = taxonomyListQuerySchema.parse({ query: req.query });
      const data = await taxonomyService.listClusters(includeInactive(validated.query.includeInactive));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listDomains(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = taxonomyListQuerySchema.parse({ query: req.query });
      const data = await taxonomyService.listDomains({
        clusterId: validated.query.clusterId,
        q: validated.query.q,
        includeInactive: includeInactive(validated.query.includeInactive),
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listGoals(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = taxonomyListQuerySchema.parse({ query: req.query });
      const data = await taxonomyService.listGoals(includeInactive(validated.query.includeInactive));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async explorer(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await taxonomyService.explorer();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async resolveDomain(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = resolveDomainSchema.parse({ query: req.query });
      const data = await taxonomyService.resolveDomain(validated.query.q);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createCluster(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = upsertClusterSchema.parse({ body: req.body });
      const data = await taxonomyService.createCluster(validated.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateCluster(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateClusterSchema.parse({ body: req.body });
      const data = await taxonomyService.updateCluster(String(req.params.id), validated.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createDomain(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = upsertDomainSchema.parse({ body: req.body });
      const data = await taxonomyService.createDomain(validated.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateDomain(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateDomainSchema.parse({ body: req.body });
      const data = await taxonomyService.updateDomain(String(req.params.id), validated.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = upsertGoalSchema.parse({ body: req.body });
      const data = await taxonomyService.createGoal(validated.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateGoalSchema.parse({ body: req.body });
      const data = await taxonomyService.updateGoal(String(req.params.id), validated.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
