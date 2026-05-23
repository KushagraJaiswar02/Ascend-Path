import { Request, Response, NextFunction } from 'express';
import { guideService } from './guide.service';
import { getGuidesQuerySchema, updateGuideProfileSchema } from './guide.validation';

export const guideController = {
  /**
   * GET /api/v1/guides
   * Fetches paginated, searchable, and filtered public guides.
   */
  async getGuides(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = getGuidesQuerySchema.parse({ query: req.query });
      const result = await guideService.listPublicGuides(validated.query);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/guides/:id
   * Compiles the public identity profile page assets (reviews, roadmaps, slots).
   */
  async getGuideById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const profile = await guideService.getPublicGuideProfile(id);
      
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/guides/profile
   * Securely updates the currently logged-in Guide's profile data.
   */
  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const validated = updateGuideProfileSchema.parse({ body: req.body });
      
      const updatedProfile = await guideService.updateGuideProfile(userId, validated.body);
      
      res.status(200).json({
        success: true,
        message: 'Guide profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  },
};
