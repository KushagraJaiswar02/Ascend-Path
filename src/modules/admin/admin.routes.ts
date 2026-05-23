import { Router } from 'express';
import { adminController } from './admin.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac';

const router = Router();

router.use(authMiddleware);

router.get('/stats', requirePermission('analytics:read'), adminController.getPlatformStats);
router.get('/analytics', requirePermission('analytics:read'), adminController.getAnalyticsOverview);
router.get('/health', requirePermission('analytics:read'), adminController.getPlatformHealth);
router.get('/audit-logs', requirePermission('audit:read'), adminController.listAuditLogs);

router.get('/users', requirePermission('users:moderate'), adminController.listUsers);
router.get('/users/:id', requirePermission('users:moderate'), adminController.getUserDetail);
router.put('/users/:id/role', requirePermission('users:roles'), adminController.assignRole);
router.post('/users/:id/ban', requirePermission('users:moderate'), adminController.banUser);
router.post('/users/:id/unban', requirePermission('users:moderate'), adminController.unbanUser);
router.post('/guides/:id/verify', requirePermission('users:moderate'), adminController.verifyGuide);

export const adminRoutes = router;
