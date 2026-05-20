import { Router, Request, Response, NextFunction } from 'express';
import { roadmapController } from './roadmap.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { createRoadmapSchema, updateRoadmapSchema, updateProgressSchema } from './roadmap.validation';

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

// Public routes
router.get('/', roadmapController.getRoadmaps);
router.get('/:id', roadmapController.getRoadmapById);

// Protected routes
router.use(authMiddleware);

router.post('/', validate(createRoadmapSchema), roadmapController.createRoadmap);
router.put('/:id', validate(updateRoadmapSchema), roadmapController.updateRoadmap);
router.delete('/:id', roadmapController.deleteRoadmap);

// Progress routes
router.post('/:id/follow', roadmapController.followRoadmap);
router.put('/:id/progress', validate(updateProgressSchema), roadmapController.updateProgress);

export const roadmapRoutes = router;
