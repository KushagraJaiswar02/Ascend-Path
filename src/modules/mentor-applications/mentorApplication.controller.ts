import { NextFunction, Request, Response } from 'express';
import { mentorApplicationService } from './mentorApplication.service';
import {
  createMentorApplicationSchema,
  listMentorApplicationsSchema,
  reviewMentorApplicationSchema,
  updateMyMentorApplicationSchema,
  uploadIntentSchema,
} from './mentorApplication.validation';

const param = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

export const mentorApplicationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createMentorApplicationSchema.parse({ body: req.body });
      const application = await mentorApplicationService.create((req as any).user._id, validated.body);
      res.status(201).json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  },

  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await mentorApplicationService.getMine((req as any).user._id);
      res.status(200).json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  },

  async updateMine(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateMyMentorApplicationSchema.parse({ body: req.body });
      const application = await mentorApplicationService.updateMine((req as any).user._id, validated.body);
      res.status(200).json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  },

  async createUploadIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = uploadIntentSchema.parse({ body: req.body });
      const intent = await mentorApplicationService.createUploadIntent((req as any).user._id, validated.body);
      res.status(200).json({ success: true, data: intent });
    } catch (error) {
      next(error);
    }
  },

  async listForAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = listMentorApplicationsSchema.parse({ query: req.query });
      const result = await mentorApplicationService.listForAdmin(validated.query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getForAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await mentorApplicationService.getForAdmin(param(req.params.id));
      res.status(200).json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = reviewMentorApplicationSchema.parse({ params: req.params, body: req.body });
      const application = await mentorApplicationService.updateStatus(
        validated.params.id,
        (req as any).user._id,
        validated.body
      );
      res.status(200).json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  },
};
