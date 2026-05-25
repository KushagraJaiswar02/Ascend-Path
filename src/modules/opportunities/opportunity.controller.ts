import { NextFunction, Request, Response } from 'express';
import { opportunityService } from './opportunity.service';
import { opportunityRepository } from './opportunity.repository';
import {
  createOpportunitySchema,
  updateApplicationSchema,
  verifyOpportunitySchema,
  opportunityQuerySchema,
  addReminderSchema,
} from './opportunity.validation';

export const opportunityController = {
  async listOpportunities(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = opportunityQuerySchema.parse({ query: req.query });
      const userId = String((req as any).user._id);
      const data = await opportunityService.listOpportunities(userId, validated.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getOpportunity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String((req as any).user._id);
      const id = String(req.params.id);
      const data = await opportunityService.getOpportunity(userId, id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createOpportunity(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createOpportunitySchema.parse({ body: req.body });
      const userId = String((req as any).user._id);
      const userRole = (req as any).user.role;
      const isAdmin = ['admin', 'architect', 'super_admin'].includes(userRole);
      
      const opportunity = await opportunityService.createOpportunity(validated.body, userId, isAdmin);
      res.status(201).json({ success: true, data: opportunity });
    } catch (error) {
      next(error);
    }
  },

  async getMyApplicationsBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String((req as any).user._id);
      const data = await opportunityService.getMyApplicationsBoard(userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async applyToOpportunity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String((req as any).user._id);
      const opportunityId = String(req.params.id);
      const data = await opportunityService.applyToOpportunity(userId, opportunityId);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateApplicationSchema.parse({ body: req.body });
      const userId = String((req as any).user._id);
      const appId = String(req.params.appId);
      const data = await opportunityService.updateApplication(userId, appId, validated.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async addReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = addReminderSchema.parse({ body: req.body });
      const userId = String((req as any).user._id);
      const appId = String(req.params.appId);
      const data = await opportunityService.addReminder(userId, appId, validated.body.date, validated.body.note);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  // Admin moderation endpoints
  async listAdminOpportunities(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const skip = (page - 1) * limit;

      const data = await opportunityRepository.listAllForAdmin(skip, limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async verifyOpportunity(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = verifyOpportunitySchema.parse({ body: req.body });
      const id = String(req.params.id);
      const opportunity = await opportunityService.verifyOpportunity(id, validated.body.verificationStatus, validated.body.isFeatured);
      res.json({ success: true, data: opportunity });
    } catch (error) {
      next(error);
    }
  },
};
