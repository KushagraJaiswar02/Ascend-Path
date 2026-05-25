import { NextFunction, Request, Response } from 'express';
import { careerCompanionService } from './careerCompanion.service';
import { companionQuerySchema, createJournalEntrySchema, submitGrowthCheckInSchema } from './companion.validation';

export const companionController = {
  async home(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await careerCompanionService.getCompanionHome((req as any).user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async timeline(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = companionQuerySchema.parse({ query: req.query });
      const data = await careerCompanionService.getCompanionHome((req as any).user._id);
      res.json({ success: true, data: { timeline: data.timeline.slice(0, validated.query.limit) } });
    } catch (error) {
      next(error);
    }
  },

  async submitCheckIn(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = submitGrowthCheckInSchema.parse({ body: req.body });
      const data = await careerCompanionService.submitCheckIn((req as any).user._id, validated.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createJournalEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createJournalEntrySchema.parse({ body: req.body });
      const data = await careerCompanionService.createJournalEntry((req as any).user._id, validated.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async mentorSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await careerCompanionService.mentorSummary((req as any).user._id, String(req.params.learnerId));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async analytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await careerCompanionService.analytics();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
