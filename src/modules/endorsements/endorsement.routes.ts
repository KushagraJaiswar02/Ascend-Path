import { Router } from 'express';
import { endorsementController } from './endorsement.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Public: View endorsements for a user's public profile
router.get('/user/:userId', endorsementController.getEndorsementsForUser);

// Authenticated: mentors/admins can issue endorsements
router.post('/', authMiddleware, endorsementController.createEndorsement);

// Authenticated: see endorsements I've issued
router.get('/my/issued', authMiddleware, endorsementController.getMyIssuedEndorsements);

// Admin: moderate an endorsement
router.patch('/:id/moderate', authMiddleware, endorsementController.moderateEndorsement);

export const endorsementRoutes = router;
