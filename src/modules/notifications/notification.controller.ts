import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';

export const notificationController = {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await notificationService.getUserNotifications(userId, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const unreadCount = await notificationService.getUnreadCount(userId);
      res.status(200).json({ success: true, data: { unreadCount } });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const notificationId = req.params.id as string;
      const notification = await notificationService.markAsRead(userId, notificationId);
      res.status(200).json({ success: true, data: { notification } });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      await notificationService.markAllAsRead(userId);
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  },
};
