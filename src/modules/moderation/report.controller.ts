import { NextFunction, Request, Response } from 'express';
import { reportService } from './report.service';
import { ReportPriority, ReportReason, ReportStatus, TargetType } from './report.model';

const param = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

export const reportController = {
  async submitReport(req: Request, res: Response, next: NextFunction) {
    try {
      const reporterId = (req as any).user._id;
      const { targetType, targetId, reason, details, description, priority } = req.body;

      const report = await reportService.submitReport({
        reporterId,
        targetType: targetType as TargetType,
        targetId,
        reason: reason as ReportReason,
        details,
        description,
        priority: priority as ReportPriority,
      });

      res.status(201).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  async listReports(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await reportService.listReports(
        {
          status: req.query.status as ReportStatus,
          priority: req.query.priority as ReportPriority,
          targetType: req.query.targetType as TargetType,
          reason: req.query.reason as ReportReason,
          assignedModerator: req.query.assignedModerator as string,
        },
        page,
        limit
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportService.getReportById(param(req.params.id));
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  async actionReport(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user._id;
      const { status, resolution } = req.body;

      const report = await reportService.actionReport(param(req.params.id), status as ReportStatus, actorId, resolution);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  async assignReport(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user._id;
      const { moderatorId } = req.body;
      const report = await reportService.assignReport(param(req.params.id), moderatorId || actorId, actorId);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  async addModeratorNote(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user._id;
      const report = await reportService.addModeratorNote(param(req.params.id), actorId, req.body.note);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  async warnUser(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user._id;
      await reportService.warnUser(param(req.params.id), req.body.reason, actorId);
      res.status(200).json({ success: true, message: 'User warned successfully' });
    } catch (error) {
      next(error);
    }
  },

  async muteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user._id;
      const result = await reportService.muteUser(param(req.params.id), Number(req.body.hours || 24), actorId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user._id;
      const result = await reportService.suspendUser(
        param(req.params.id),
        Number(req.body.days || 7),
        actorId,
        req.body.reason || 'Policy violation'
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async adjustReputation(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user._id;
      const result = await reportService.adjustReputation(
        param(req.params.id),
        Number(req.body.delta || 0),
        actorId,
        req.body.reason || 'Administrative adjustment'
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async hideContent(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user._id;
      const result = await reportService.hideContent(
        req.body.targetType as TargetType,
        req.body.targetId,
        actorId,
        req.body.reason || 'Moderation action'
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async softDeleteContent(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user._id;
      const result = await reportService.softDeleteContent(
        req.body.targetType as TargetType,
        req.body.targetId,
        actorId,
        req.body.reason || 'Moderation action'
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async bulkAction(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user._id;
      const result = await reportService.bulkAction(actorId, req.body.reportIds || [], req.body.action, req.body.payload || {});
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
