import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { onboardingController } from './onboarding.controller';

const router = Router();

router.use(authMiddleware);
router.post('/', onboardingController.submit);
router.get('/recommendations', onboardingController.recommendations);
router.get('/dashboard-experience', onboardingController.dashboardExperience);

export const onboardingRoutes = router;
