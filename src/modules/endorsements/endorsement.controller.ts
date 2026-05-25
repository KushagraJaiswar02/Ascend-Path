import { Request, Response, NextFunction } from 'express';
import { endorsementService } from './endorsement.service';

export const endorsementController = {
  async createEndorsement(req: Request, res: Response, next: NextFunction) {
    try {
      const endorserId = (req as any).user._id.toString();
      const endorsement = await endorsementService.createEndorsement(endorserId, req.body);
      res.status(201).json({ success: true, data: { endorsement } });
    } catch (error) {
      next(error);
    }
  },

  async getEndorsementsForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const endorsements = await endorsementService.getEndorsementsForUser(userId as string);
      res.status(200).json({ success: true, data: { endorsements } });
    } catch (error) {
      next(error);
    }
  },

  async getMyIssuedEndorsements(req: Request, res: Response, next: NextFunction) {
    try {
      const endorserId = (req as any).user._id.toString();
      const endorsements = await endorsementService.getMyIssuedEndorsements(endorserId);
      res.status(200).json({ success: true, data: { endorsements } });
    } catch (error) {
      next(error);
    }
  },

  async moderateEndorsement(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user._id.toString();
      const { id } = req.params;
      const { status } = req.body;
      const endorsement = await endorsementService.moderateEndorsement(adminId, id as string, status);
      res.status(200).json({ success: true, data: { endorsement } });
    } catch (error) {
      next(error);
    }
  },
};
