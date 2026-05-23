import { NextFunction, Request, Response } from 'express';
import { onboardingService } from './onboarding.service';
import { submitOnboardingSchema } from './onboarding.validation';

export const onboardingController = {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = submitOnboardingSchema.parse({ body: req.body });
      const result = await onboardingService.submit((req as any).user._id, validated.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async recommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await onboardingService.getRecommendations((req as any).user._id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
