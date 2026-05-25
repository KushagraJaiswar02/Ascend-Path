import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { checkSuspended } from '../../middleware/suspension.middleware';
import { mentorshipController } from './mentorship.controller';

const router = Router();

router.use(authMiddleware);

router.get('/conversations', mentorshipController.list);
router.post('/conversations', checkSuspended, mentorshipController.create);
router.get('/conversations/:id', mentorshipController.get);
router.post('/conversations/:id/messages', checkSuspended, mentorshipController.sendMessage);
router.post('/conversations/:id/read', mentorshipController.markRead);
router.post('/conversations/:id/archive', mentorshipController.archive);
router.post('/conversations/:id/block', mentorshipController.block);
router.post('/conversations/:id/pin-advice', mentorshipController.pinAdvice);
router.post('/conversations/:id/escalations', checkSuspended, mentorshipController.requestEscalation);
router.post('/conversations/:id/escalations/:requestId/respond', checkSuspended, mentorshipController.respondEscalation);

export const mentorshipRoutes = router;
