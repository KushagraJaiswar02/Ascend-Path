import { Router } from 'express';
import { reviewController } from './review.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// All modification routes require authentication
router.use(authMiddleware);

router.post('/', reviewController.createReview);
router.patch('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.post('/:id/report', reviewController.reportReview);

export const reviewRoutes = router;
