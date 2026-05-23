import { Request, Response, NextFunction } from 'express';
import { roadmapService } from './roadmap.service';
import { roadmapCommunityService } from './roadmapCommunity.service';

export const roadmapController = {
  // --- Roadmap Controller Actions ---
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
      const difficulty = typeof req.query.difficulty === 'string' ? req.query.difficulty : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'fameScore';

      const result = await roadmapService.getRoadmaps(page, limit, domain, difficulty, search, sortBy);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getRoadmapById(req: Request, res: Response, next: NextFunction) {
    try {
      const idOrSlug = req.params.id as string;
      const roadmap = await roadmapService.getRoadmapById(idOrSlug);
      res.status(200).json({ success: true, data: { roadmap } });
    } catch (error) {
      next(error);
    }
  },

  async getRoadmapCommunity(req: Request, res: Response, next: NextFunction) {
    try {
      const community = await roadmapCommunityService.getRoadmapCommunity(req.params.id as string);
      res.status(200).json({ success: true, data: { community } });
    } catch (error) {
      next(error);
    }
  },

  async getRoadmapActiveLearners(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await roadmapCommunityService.getActiveLearners(req.params.id as string, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getTrendingRoadmaps(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const roadmaps = await roadmapCommunityService.getTrendingRoadmaps(limit);
      res.status(200).json({ success: true, data: { roadmaps } });
    } catch (error) {
      next(error);
    }
  },

  async getMyRoadmapMomentum(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const momentum = await roadmapCommunityService.getDashboardMomentumForUser(userId);
      res.status(200).json({ success: true, data: { momentum } });
    } catch (error) {
      next(error);
    }
  },

  // --- Section Controller Actions ---
  async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const roadmapId = req.params.id as string;
      const section = await roadmapService.createSection(userId, roadmapId, req.body);
      res.status(201).json({ success: true, data: { section } });
    } catch (error) {
      next(error);
    }
  },

  async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const sectionId = req.params.id as string;
      const section = await roadmapService.updateSection(userId, sectionId, req.body);
      res.status(200).json({ success: true, data: { section } });
    } catch (error) {
      next(error);
    }
  },

  async deleteSection(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const sectionId = req.params.id as string;
      await roadmapService.deleteSection(userId, sectionId);
      res.status(200).json({ success: true, message: 'Section deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // --- Step Controller Actions ---
  async createStep(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const sectionId = req.params.id as string;
      const step = await roadmapService.createStep(userId, sectionId, req.body);
      res.status(201).json({ success: true, data: { step } });
    } catch (error) {
      next(error);
    }
  },

  async updateStep(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const stepId = req.params.id as string;
      const step = await roadmapService.updateStep(userId, stepId, req.body);
      res.status(200).json({ success: true, data: { step } });
    } catch (error) {
      next(error);
    }
  },

  async deleteStep(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const stepId = req.params.id as string;
      await roadmapService.deleteStep(userId, stepId);
      res.status(200).json({ success: true, message: 'Step deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // --- Progression, Streaks, & Bookmarks Controller Actions ---
  async enrollUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const roadmapId = req.params.id as string;
      const progress = await roadmapService.enrollUser(userId, roadmapId);
      res.status(201).json({ success: true, data: { progress } });
    } catch (error) {
      next(error);
    }
  },

  async toggleStepComplete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const stepId = req.params.id as string;
      const progress = await roadmapService.toggleStepCompletion(userId, stepId, true);
      res.status(200).json({ success: true, data: { progress } });
    } catch (error) {
      next(error);
    }
  },

  async toggleStepUncomplete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const stepId = req.params.id as string;
      const progress = await roadmapService.toggleStepCompletion(userId, stepId, false);
      res.status(200).json({ success: true, data: { progress } });
    } catch (error) {
      next(error);
    }
  },

  async getMyActiveRoadmaps(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const progressList = await roadmapService.getUserActiveProgress(userId);
      res.status(200).json({ success: true, data: progressList });
    } catch (error) {
      next(error);
    }
  },

  async getMyRoadmapProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const roadmapId = req.params.id as string;
      const progress = await roadmapService.getUserProgress(userId, roadmapId);
      res.status(200).json({ success: true, data: { progress } });
    } catch (error) {
      next(error);
    }
  },

  async updateProgressDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const roadmapId = req.params.id as string;
      const progress = await roadmapService.updateProgressDetails(userId, roadmapId, req.body);
      res.status(200).json({ success: true, data: { progress } });
    } catch (error) {
      next(error);
    }
  },
};
