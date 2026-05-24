import { Router } from 'express';
import { pingController } from './ping.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { checkSuspended } from '../../middleware/suspension.middleware';
import { createPingSchema, respondPingSchema, ratePingSchema } from './ping.validation';
import { Request, Response, NextFunction } from 'express';
import { pingLimiter } from '../../middleware/rateLimiter';

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

// All ping routes require authentication
router.use(authMiddleware);

// Create a new ping
router.post('/', checkSuspended, pingLimiter, validate(createPingSchema), pingController.createPing);

// Get pings
router.get('/sent', pingController.getSentPings);
router.get('/inbox', pingController.getInboxPings);

// Actions on specific pings
router.post('/:id/respond', checkSuspended, validate(respondPingSchema), pingController.respondPing);
router.post('/:id/rate', validate(ratePingSchema), pingController.ratePing);
router.post('/:id/close', pingController.closePing);

export const pingRoutes = router;
