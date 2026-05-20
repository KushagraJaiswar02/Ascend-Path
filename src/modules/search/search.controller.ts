import { Request, Response, NextFunction } from 'express';
import { searchService } from './search.service';

export const searchController = {
  async searchGuides(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string || '';
      const sort = req.query.sort as string || 'popular';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters = {
        domain: req.query.domain as string,
        minFameScore: req.query.minFameScore as string,
        isFree: req.query.isFree as string,
      };

      const result = await searchService.searchGuides(q, filters, sort, page, limit);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async searchRoadmaps(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string || '';
      const sort = req.query.sort as string || 'popular';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters = {
        domain: req.query.domain as string,
        maxEstimatedWeeks: req.query.maxEstimatedWeeks as string,
      };

      const result = await searchService.searchRoadmaps(q, filters, sort, page, limit);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async searchPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string || '';
      const sort = req.query.sort as string || 'recent';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters = {
        category: req.query.category as string,
        tags: req.query.tags as string | string[],
        isSolved: req.query.isSolved as string,
      };

      const result = await searchService.searchPosts(q, filters, sort, page, limit);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
};
