import { Router } from 'express';
import { guideController } from './guide.controller';
import { reviewController } from '../reviews/review.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Public endpoints
router.get('/', guideController.getGuides);
router.get('/:id', guideController.getGuideById);
router.get('/:id/reviews', reviewController.getGuideReviews);

// Authenticated Guide endpoints
router.patch('/profile', authMiddleware, guideController.updateMyProfile);

export const guideRoutes = router;
