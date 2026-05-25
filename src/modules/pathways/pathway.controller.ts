import { NextFunction, Request, Response } from 'express';
import { careerPathwayGraphService } from './careerPathwayGraph.service';
import { domainHubSchema, updatePathwayConnectionSchema, upsertPathwayConnectionSchema } from './pathway.validation';

export const pathwayController = {
  async domainHub(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = domainHubSchema.parse({ params: req.params });
      const data = await careerPathwayGraphService.domainHub(validated.params.slug);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async myJourney(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await careerPathwayGraphService.userJourney((req as any).user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = upsertPathwayConnectionSchema.parse({ body: req.body });
      const data = await careerPathwayGraphService.createConnection(validated.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updatePathwayConnectionSchema.parse({ body: req.body });
      const data = await careerPathwayGraphService.updateConnection(String(req.params.id), validated.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
