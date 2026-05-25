import { NextFunction, Request, Response } from 'express';
import { recommendationEngineService } from './recommendationEngine.service';
import { recommendationInteractionSchema, recommendationQuerySchema } from './recommendation.validation';

export const recommendationController = {
  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = recommendationQuerySchema.parse({ query: req.query });
      const result = await recommendationEngineService.getRecommendations(
        (req as any).user._id,
        validated.query.context,
        validated.query.limit,
        validated.query.refresh === 'true'
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async recordInteraction(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = recommendationInteractionSchema.parse({ body: req.body });
      const result = await recommendationEngineService.recordInteraction((req as any).user._id, validated.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async analytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recommendationEngineService.analytics();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
