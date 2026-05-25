import { Request, Response, NextFunction } from 'express';
import { achievementService } from './achievement.service';

export const achievementController = {
  async getAchievementsByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String(req.params.userId);
      const achievements = await achievementService.getAchievementsByUser(userId);
      res.json({ success: true, data: achievements });
    } catch (error) {
      next(error);
    }
  },

  async verifyCredential(req: Request, res: Response, next: NextFunction) {
    try {
      const credentialId = String(req.params.credentialId).toUpperCase();
      const achievement = await achievementService.verifyCredential(credentialId);

      if (!achievement) {
        return res.status(404).json({ success: false, message: 'Invalid credential ID. Verification failed.' });
      }

      res.json({ success: true, data: achievement });
    } catch (error) {
      next(error);
    }
  },
};
