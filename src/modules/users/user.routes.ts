import { Router } from 'express';
import { userController } from './user.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', userController.registerUser);
router.get('/guides', userController.getGuides);
router.get('/username/:username', userController.getPublicProfileByUsername);
router.get('/:id', userController.getUserById);

// Authenticated routes
router.get('/me/profile', authMiddleware, userController.getMyProfile);
router.patch('/me/professional', authMiddleware, userController.updateProfessionalProfile);

export const userRoutes = router;
