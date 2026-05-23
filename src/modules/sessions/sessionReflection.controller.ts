import { NextFunction, Request, Response } from 'express';
import { sessionReflectionService } from './sessionReflection.service';

export const sessionReflectionController = {
  async submitReflection(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id.toString();
      const reflection = await sessionReflectionService.submitMenteeReflection(userId, req.params.id as string, req.body);
      res.status(200).json({ success: true, data: { reflection } });
    } catch (error) {
      next(error);
    }
  },

  async submitFollowup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id.toString();
      const reflection = await sessionReflectionService.submitMentorFollowup(userId, req.params.id as string, req.body);
      res.status(200).json({ success: true, data: { reflection } });
    } catch (error) {
      next(error);
    }
  },

  async getMyReflections(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id.toString();
      const limit = parseInt(req.query.limit as string) || 20;
      const reflections = await sessionReflectionService.getMyReflections(userId, limit);
      res.status(200).json({ success: true, data: { reflections } });
    } catch (error) {
      next(error);
    }
  },

  async getSessionReflection(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id.toString();
      const reflection = await sessionReflectionService.getReflectionForSession(userId, req.params.id as string);
      res.status(200).json({ success: true, data: { reflection } });
    } catch (error) {
      next(error);
    }
  },
};
