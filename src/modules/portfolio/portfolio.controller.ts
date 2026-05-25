import { Request, Response, NextFunction } from 'express';
import { portfolioService } from './portfolio.service';
import { createProjectSchema, updateProjectSchema, reviewProjectSchema } from './portfolio.validation';

export const portfolioController = {
  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createProjectSchema.parse({ body: req.body });
      const userId = String((req as any).user._id);
      
      const payload = { ...validated.body };
      if (payload.roadmapId === '') delete payload.roadmapId;

      const project = await portfolioService.createProject(userId, payload);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async getProjectsByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String(req.params.userId);
      const projects = await portfolioService.getProjectsByUser(userId);
      res.json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  },

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateProjectSchema.parse({ body: req.body });
      const userId = String((req as any).user._id);
      const id = String(req.params.id);

      const payload = { ...validated.body };
      if (payload.roadmapId === '') delete payload.roadmapId;

      const project = await portfolioService.updateProject(userId, id, payload);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String((req as any).user._id);
      const id = String(req.params.id);

      await portfolioService.deleteProject(userId, id);
      res.json({ success: true, message: 'Portfolio project deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async reviewProject(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = reviewProjectSchema.parse({ body: req.body });
      const mentorId = String((req as any).user._id);
      const id = String(req.params.id);

      const project = await portfolioService.reviewProject(mentorId, id, validated.body.reviewNotes);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },
};
