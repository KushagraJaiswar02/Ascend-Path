import { Router } from 'express';
import { reportController } from './report.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac';
import { checkSuspended } from '../../middleware/suspension.middleware';

const router = Router();

router.post('/', authMiddleware, checkSuspended, reportController.submitReport);

router.use(authMiddleware);

router.get('/me', reportController.getMyReports);
router.get('/', requirePermission('reports:read'), reportController.listReports);
router.get('/:id', requirePermission('reports:read'), reportController.getReport);
router.put('/:id', requirePermission('reports:write'), reportController.actionReport);
router.patch('/:id/review', requirePermission('reports:write'), reportController.reviewReport);
router.patch('/:id/escalate', requirePermission('reports:write'), reportController.escalateReport);
router.patch('/:id/assign', requirePermission('reports:write'), reportController.assignReport);
router.patch('/:id/notes', requirePermission('reports:write'), reportController.addModeratorNote);
router.post('/bulk', requirePermission('reports:bulk'), reportController.bulkAction);

router.post('/content/hide', requirePermission('content:moderate'), reportController.hideContent);
router.post('/content/delete', requirePermission('content:moderate'), reportController.softDeleteContent);
router.post('/posts/:postId/accept/:replyId', requirePermission('content:moderate'), reportController.overrideAcceptedAnswer);
router.delete('/posts/:postId/accept', requirePermission('content:moderate'), reportController.clearAcceptedAnswer);

router.post('/users/:id/warn', requirePermission('users:moderate'), reportController.warnUser);
router.post('/users/:id/mute', requirePermission('users:moderate'), reportController.muteUser);
router.post('/users/:id/suspend', requirePermission('users:moderate'), reportController.suspendUser);
router.post('/users/:id/reputation', requirePermission('users:moderate'), reportController.adjustReputation);

export const reportRoutes = router;
