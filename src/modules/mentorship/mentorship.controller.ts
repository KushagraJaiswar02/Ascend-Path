import { NextFunction, Request, Response } from 'express';
import { mentorshipService } from './mentorship.service';
import {
  conversationParamsSchema,
  createConversationSchema,
  escalationResponseSchema,
  escalationSchema,
  pinAdviceSchema,
  sendMessageSchema,
} from './mentorship.validation';

export const mentorshipController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const conversations = await mentorshipService.listConversations((req as any).user._id, req.query.status as string | undefined);
      res.json({ success: true, data: { conversations } });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createConversationSchema.parse({ body: req.body });
      const data = await mentorshipService.startConversation((req as any).user._id, validated.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = conversationParamsSchema.parse({ params: req.params });
      const data = await mentorshipService.getConversation((req as any).user._id, validated.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = sendMessageSchema.parse({ params: req.params, body: req.body });
      const message = await mentorshipService.sendMessage((req as any).user._id, validated.params.id, validated.body);
      res.status(201).json({ success: true, data: { message } });
    } catch (error) {
      next(error);
    }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = conversationParamsSchema.parse({ params: req.params });
      const conversation = await mentorshipService.markRead((req as any).user._id, validated.params.id);
      res.json({ success: true, data: { conversation } });
    } catch (error) {
      next(error);
    }
  },

  async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = conversationParamsSchema.parse({ params: req.params });
      const conversation = await mentorshipService.archive((req as any).user._id, validated.params.id);
      res.json({ success: true, data: { conversation } });
    } catch (error) {
      next(error);
    }
  },

  async block(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = conversationParamsSchema.parse({ params: req.params });
      const conversation = await mentorshipService.block((req as any).user._id, validated.params.id);
      res.json({ success: true, data: { conversation } });
    } catch (error) {
      next(error);
    }
  },

  async pinAdvice(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = pinAdviceSchema.parse({ params: req.params, body: req.body });
      const conversation = await mentorshipService.pinAdvice((req as any).user._id, validated.params.id, validated.body.advice);
      res.json({ success: true, data: { conversation } });
    } catch (error) {
      next(error);
    }
  },

  async requestEscalation(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = escalationSchema.parse({ params: req.params, body: req.body });
      const request = await mentorshipService.requestEscalation((req as any).user._id, validated.params.id, validated.body);
      res.status(201).json({ success: true, data: { request } });
    } catch (error) {
      next(error);
    }
  },

  async respondEscalation(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = escalationResponseSchema.parse({ params: req.params, body: req.body });
      const request = await mentorshipService.respondEscalation((req as any).user._id, validated.params.id, validated.params.requestId, validated.body);
      res.json({ success: true, data: { request } });
    } catch (error) {
      next(error);
    }
  },
};
