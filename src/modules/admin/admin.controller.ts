import { NextFunction, Request, Response } from 'express';
import { adminService } from './admin.service';
import { Role } from '../users/user.model';
import { AuditAction } from '../moderation/auditLog.model';

const param = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

export const adminController = {
  async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user._id;
      const result = await adminService.assignRole(param(req.params.id), req.body.role as Role, actorId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async banUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.banUser(param(req.params.id), (req as any).user._id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async unbanUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.unbanUser(param(req.params.id), (req as any).user._id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async verifyGuide(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.verifyGuide(param(req.params.id), (req as any).user._id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.listUsers(
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20,
        req.query.search as string,
        req.query.role as Role
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getUserDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getUserDetail(param(req.params.id));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getPlatformStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getPlatformStats();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getAnalyticsOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getAnalyticsOverview();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getPlatformHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getPlatformHealth();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async listAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.listAuditLogs(
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20,
        req.query.action as AuditAction,
        req.query.targetType as string
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
