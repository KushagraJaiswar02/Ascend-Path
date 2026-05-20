import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { Role } from '../users/user.model';

export const adminController = {
  async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const architectId = (req as any).user._id;
      const userId = req.params.id as string;
      const { role } = req.body;

      const result = await adminService.assignRole(userId, role as Role, architectId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async banUser(req: Request, res: Response, next: NextFunction) {
    try {
      const architectId = (req as any).user._id;
      const userId = req.params.id as string;

      const result = await adminService.banUser(userId, architectId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async unbanUser(req: Request, res: Response, next: NextFunction) {
    try {
      const architectId = (req as any).user._id;
      const userId = req.params.id as string;

      const result = await adminService.unbanUser(userId, architectId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async verifyGuide(req: Request, res: Response, next: NextFunction) {
    try {
      const architectId = (req as any).user._id;
      const userId = req.params.id as string;

      const result = await adminService.verifyGuide(userId, architectId);
      res.status(200).json(result);
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
};
