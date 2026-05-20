import { Request, Response, NextFunction } from 'express';
import { sessionService } from './session.service';

export const sessionController = {
  async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const session = await sessionService.createSession(userId, req.body);
      res.status(201).json({ success: true, data: { session } });
    } catch (error) {
      next(error);
    }
  },

  async updateSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const session = await sessionService.updateSession(userId, req.params.id as string, req.body);
      res.status(200).json({ success: true, data: { session } });
    } catch (error) {
      next(error);
    }
  },

  async deleteSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      await sessionService.deleteSession(userId, req.params.id as string);
      res.status(200).json({ success: true, message: 'Session deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getOpenSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await sessionService.getOpenSessions(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getMySessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await sessionService.getUserSessions(userId, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getSessionById(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await sessionService.getSessionById(req.params.id as string);
      res.status(200).json({ success: true, data: { session } });
    } catch (error) {
      next(error);
    }
  },

  async bookSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const session = await sessionService.bookSession(userId, req.params.id as string);
      res.status(200).json({ success: true, data: { session } });
    } catch (error) {
      next(error);
    }
  },

  async cancelSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const session = await sessionService.cancelSession(userId, req.params.id as string);
      res.status(200).json({ success: true, data: { session } });
    } catch (error) {
      next(error);
    }
  },

  async completeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const session = await sessionService.completeSession(userId, req.params.id as string);
      res.status(200).json({ success: true, data: { session } });
    } catch (error) {
      next(error);
    }
  },

  async rateSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const session = await sessionService.rateSession(userId, req.params.id as string, req.body);
      res.status(200).json({ success: true, data: { session } });
    } catch (error) {
      next(error);
    }
  },
};
