import { Router, Request, Response, NextFunction } from 'express';
import { roadmapController } from './roadmap.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createRoadmapSchema,
  updateRoadmapSchema,
  createSectionSchema,
  updateSectionSchema,
  createStepSchema,
  updateStepSchema,
  updateProgressSchema,
} from './roadmap.validation';

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

// --- ROADMAPS ROUTER ---
const roadmapRouter = Router();
roadmapRouter.get('/', roadmapController.getRoadmaps);
roadmapRouter.get('/:id', roadmapController.getRoadmapById);

// Protected Roadmap routes
roadmapRouter.post('/', authMiddleware, validate(createRoadmapSchema), roadmapController.createRoadmap);
roadmapRouter.patch('/:id', authMiddleware, validate(updateRoadmapSchema), roadmapController.updateRoadmap);
roadmapRouter.delete('/:id', authMiddleware, roadmapController.deleteRoadmap);

// Sections nested under Roadmaps
roadmapRouter.post('/:id/sections', authMiddleware, validate(createSectionSchema), roadmapController.createSection);

// Enrollment & Progress nested under Roadmaps
roadmapRouter.post('/:id/enroll', authMiddleware, roadmapController.enrollUser);
roadmapRouter.patch('/:id/progress-details', authMiddleware, validate(updateProgressSchema), roadmapController.updateProgressDetails);
roadmapRouter.put('/:id/progress-details', authMiddleware, validate(updateProgressSchema), roadmapController.updateProgressDetails);

// --- SECTIONS ROUTER ---
const sectionRouter = Router();
sectionRouter.use(authMiddleware);
sectionRouter.patch('/:id', validate(updateSectionSchema), roadmapController.updateSection);
sectionRouter.delete('/:id', roadmapController.deleteSection);
sectionRouter.post('/:id/steps', validate(createStepSchema), roadmapController.createStep);

// --- STEPS ROUTER ---
const stepRouter = Router();
stepRouter.use(authMiddleware);
stepRouter.patch('/:id', validate(updateStepSchema), roadmapController.updateStep);
stepRouter.delete('/:id', roadmapController.deleteStep);
stepRouter.post('/:id/complete', roadmapController.toggleStepComplete);
stepRouter.post('/:id/uncomplete', roadmapController.toggleStepUncomplete);

// --- ME ROADMAPS ROUTER ---
const meRoadmapRouter = Router();
meRoadmapRouter.use(authMiddleware);
meRoadmapRouter.get('/', roadmapController.getMyActiveRoadmaps);
meRoadmapRouter.get('/:id/progress', roadmapController.getMyRoadmapProgress);

export {
  roadmapRouter as roadmapRoutes,
  sectionRouter as sectionRoutes,
  stepRouter as stepRoutes,
  meRoadmapRouter as meRoadmapRoutes,
};

