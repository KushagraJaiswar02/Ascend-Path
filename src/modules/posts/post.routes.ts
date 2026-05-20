import { Router, Request, Response, NextFunction } from 'express';
import { postController } from './post.controller';
import { createPostSchema, updatePostSchema, createReplySchema } from './post.validation';
import { ZodTypeAny } from 'zod';
import { authMiddleware } from '../../middleware/auth.middleware';

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

// Post Routes
router.post('/', authMiddleware, validate(createPostSchema), postController.createPost);
router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', authMiddleware, validate(updatePostSchema), postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

// Reply Routes
router.post('/:id/replies', authMiddleware, validate(createReplySchema), postController.createReply);
router.get('/:id/replies', postController.getReplies);

// Voting & Solving Routes
router.post('/:id/vote', authMiddleware, postController.votePost);
router.post('/replies/:id/vote', authMiddleware, postController.voteReply);
router.post('/:id/solve', authMiddleware, postController.markSolution);

export const postRoutes = router;
