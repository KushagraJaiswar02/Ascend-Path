import { Request, Response, NextFunction } from 'express';
import { reportService } from './report.service';
import { ReportStatus, TargetType, ReportReason } from './report.model';

export const reportController = {
  async submitReport(req: Request, res: Response, next: NextFunction) {
    try {
      const reporterId = (req as any).user._id;
      const { targetType, targetId, reason, details } = req.body;

      const report = await reportService.submitReport({
        reporterId,
        targetType: targetType as TargetType,
        targetId,
        reason: reason as ReportReason,
        details,
      });

      res.status(201).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  async getPendingReports(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await reportService.getPendingReports(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async actionReport(req: Request, res: Response, next: NextFunction) {
    try {
      const sentinelId = (req as any).user._id;
      const reportId = req.params.id as string;
      const { status } = req.body;

      const report = await reportService.actionReport(reportId, status as ReportStatus, sentinelId);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  async warnUser(req: Request, res: Response, next: NextFunction) {
    try {
      const sentinelId = (req as any).user._id;
      const userId = req.params.id as string;
      const { reason } = req.body;

      await reportService.warnUser(userId, reason, sentinelId);
      res.status(200).json({ success: true, message: 'User warned successfully' });
    } catch (error) {
      next(error);
    }
  },

  async muteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const sentinelId = (req as any).user._id;
      const userId = req.params.id as string;
      const { hours } = req.body;

      await reportService.muteUser(userId, hours, sentinelId);
      res.status(200).json({ success: true, message: `User muted for ${hours} hours` });
    } catch (error) {
      next(error);
    }
  },
};
