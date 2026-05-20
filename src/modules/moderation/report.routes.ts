import { Router } from 'express';
import { reportController } from './report.controller';
import { authMiddleware, authorize } from '../../middleware/auth.middleware';
import { Role } from '../users/user.model';

const router = Router();

// Publicly authenticated (Any user can report)
router.post('/', authMiddleware, reportController.submitReport);

// Sentinel Only Routes
router.use(authMiddleware, authorize(Role.SENTINEL, Role.ARCHITECT));

router.get('/', reportController.getPendingReports);
router.put('/:id', reportController.actionReport);

router.post('/users/:id/warn', reportController.warnUser);
router.post('/users/:id/mute', reportController.muteUser);

export const reportRoutes = router;
