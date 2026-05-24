import { Router, Request, Response, NextFunction } from 'express';
import { postController } from './post.controller';
import { createPostSchema, updatePostSchema, createReplySchema } from './post.validation';
import { ZodTypeAny } from 'zod';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/auth.middleware';
import { checkSuspended } from '../../middleware/suspension.middleware';

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
router.post('/', authMiddleware, checkSuspended, validate(createPostSchema), postController.createPost);
router.get('/', optionalAuthMiddleware, postController.getPosts);
router.get('/resolved', postController.getResolvedPosts);
router.post('/:postId/accept/:replyId', authMiddleware, postController.acceptAnswer);
router.delete('/:postId/accept', authMiddleware, postController.unacceptAnswer);
router.post('/:id/view', postController.incrementPostView);
router.get('/:id', postController.getPostById);
router.put('/:id', authMiddleware, validate(updatePostSchema), postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

// Reply Routes
router.post('/:id/replies', authMiddleware, checkSuspended, validate(createReplySchema), postController.createReply);
router.get('/:id/replies', postController.getReplies);

// Voting & Solving Routes
router.post('/:id/vote', authMiddleware, postController.votePost);
router.post('/replies/:id/vote', authMiddleware, postController.voteReply);
router.post('/:id/solve', authMiddleware, postController.markSolution);

export const postRoutes = router;
