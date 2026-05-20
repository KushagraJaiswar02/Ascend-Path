import { Request, Response, NextFunction } from 'express';
import { roadmapService } from './roadmap.service';

export const roadmapController = {
  async createRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const roadmap = await roadmapService.createRoadmap(userId, req.body);
      res.status(201).json({ success: true, data: { roadmap } });
    } catch (error) {
      next(error);
    }
  },

  async updateRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const roadmap = await roadmapService.updateRoadmap(userId, req.params.id as string, req.body);
      res.status(200).json({ success: true, data: { roadmap } });
    } catch (error) {
      next(error);
    }
  },

  async deleteRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      await roadmapService.deleteRoadmap(userId, req.params.id as string);
      res.status(200).json({ success: true, message: 'Roadmap deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getRoadmaps(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const domain = typeof req.query.domain === 'string' ? req.query.domain : undefined;

      const result = await roadmapService.getRoadmaps(page, limit, domain);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getRoadmapById(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmap = await roadmapService.getRoadmapById(req.params.id as string);
      res.status(200).json({ success: true, data: { roadmap } });
    } catch (error) {
      next(error);
    }
  },

  async followRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const progress = await roadmapService.followRoadmap(userId, req.params.id as string);
      res.status(201).json({ success: true, data: { progress } });
    } catch (error) {
      next(error);
    }
  },

  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const progress = await roadmapService.updateProgress(userId, req.params.id as string, req.body);
      res.status(200).json({ success: true, data: { progress } });
    } catch (error) {
      next(error);
    }
  },
};
