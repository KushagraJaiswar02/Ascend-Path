import { Router } from 'express';
import { adminController } from './admin.controller';
import { authMiddleware, authorize } from '../../middleware/auth.middleware';
import { Role } from '../users/user.model';

const router = Router();

// Architect Only Routes
router.use(authMiddleware, authorize(Role.ARCHITECT));

router.put('/users/:id/role', adminController.assignRole);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);
router.post('/guides/:id/verify', adminController.verifyGuide);
router.get('/stats', adminController.getPlatformStats);

export const adminRoutes = router;
