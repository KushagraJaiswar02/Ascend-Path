import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac';
import { mentorApplicationController } from './mentorApplication.controller';

const router = Router();
const adminRouter = Router();

router.use(authMiddleware);
router.post('/', mentorApplicationController.create);
router.get('/me', mentorApplicationController.getMine);
router.patch('/me', mentorApplicationController.updateMine);
router.post('/upload-intent', mentorApplicationController.createUploadIntent);

adminRouter.use(authMiddleware);
adminRouter.get('/', requirePermission('mentor_applications:read'), mentorApplicationController.listForAdmin);
adminRouter.get('/:id', requirePermission('mentor_applications:read'), mentorApplicationController.getForAdmin);
adminRouter.patch('/:id/status', requirePermission('mentor_applications:review'), mentorApplicationController.updateStatus);

export const mentorApplicationRoutes = router;
export const adminMentorApplicationRoutes = adminRouter;
