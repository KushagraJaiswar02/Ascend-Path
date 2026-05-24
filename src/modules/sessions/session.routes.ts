import { Router, Request, Response, NextFunction } from 'express';
import { sessionController } from './session.controller';
import { sessionReflectionController } from './sessionReflection.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { checkSuspended } from '../../middleware/suspension.middleware';
import { createSessionSchema, updateSessionSchema, rateSessionSchema } from './session.validation';
import { submitMentorFollowupSchema, submitSessionReflectionSchema } from './sessionReflection.validation';

const router = Router();

// Validation Middleware
const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err: any) {
    res.status(400);
    next(err);
  }
};

// All session routes require authentication
router.use(authMiddleware);

// Core CRUD
router.post('/', checkSuspended, validate(createSessionSchema), sessionController.createSession);
router.get('/', sessionController.getOpenSessions);
router.get('/me', sessionController.getMySessions);
router.get('/me/reflections', sessionReflectionController.getMyReflections);
router.get('/public', sessionController.getPublicWorkshops);
router.post('/:id/reflection', validate(submitSessionReflectionSchema), sessionReflectionController.submitReflection);
router.patch('/:id/followup', validate(submitMentorFollowupSchema), sessionReflectionController.submitFollowup);
router.get('/:id/reflection', sessionReflectionController.getSessionReflection);
router.get('/:id', sessionController.getSessionById);
router.put('/:id', validate(updateSessionSchema), sessionController.updateSession);
router.delete('/:id', sessionController.deleteSession);

// State transitions & Actions
router.post('/:id/book', checkSuspended, sessionController.bookSession);
router.post('/:id/register', checkSuspended, sessionController.registerForPublicSession);
router.post('/:id/cancel', sessionController.cancelSession);
router.post('/:id/start', sessionController.startSession);
router.post('/:id/join', sessionController.joinSession);
router.post('/:id/end', sessionController.endSession);
router.post('/:id/complete', sessionController.completeSession);
router.get('/:id/execution', sessionController.getSessionExecution);
router.post('/:id/rate', validate(rateSessionSchema), sessionController.rateSession);

export const sessionRoutes = router;
