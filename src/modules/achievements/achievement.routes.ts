import { Router } from 'express';
import { achievementController } from './achievement.controller';

const router = Router();

// Public routes for portfolio pages & public verification checks
router.get('/user/:userId', achievementController.getAchievementsByUser);
router.get('/verify/:credentialId', achievementController.verifyCredential);

export const achievementRoutes = router;
