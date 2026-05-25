import { Router } from 'express';
import { portfolioController } from './portfolio.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/user/:userId', portfolioController.getProjectsByUser);

// Authenticated user routes
router.post('/', authMiddleware, portfolioController.createProject);
router.patch('/:id', authMiddleware, portfolioController.updateProject);
router.delete('/:id', authMiddleware, portfolioController.deleteProject);

// Mentor-only routes (middleware/RBAC handled in service or controller)
router.post('/:id/review', authMiddleware, portfolioController.reviewProject);

export const portfolioRoutes = router;
