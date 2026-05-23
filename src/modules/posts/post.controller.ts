import { Request, Response, NextFunction } from 'express';
import { postService } from './post.service';

export const postController = {
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const post = await postService.createPost(userId, req.body);
      res.status(201).json({ success: true, data: { post } });
    } catch (error) {
      next(error);
    }
  },

  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const tags = typeof req.query.tags === 'string' ? req.query.tags : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const resolution =
        req.query.resolution === 'resolved' || req.query.resolution === 'unresolved'
          ? req.query.resolution
          : undefined;

      const result = await postService.getPosts(page, limit, category, tags, search, resolution);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getResolvedPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await postService.getResolvedPosts(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postService.getPostById(req.params.id as string);
      res.status(200).json({ success: true, data: { post } });
    } catch (error) {
      next(error);
    }
  },

  async incrementPostView(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postService.incrementPostView(req.params.id as string);
      res.status(200).json({ success: true, data: { viewCount: post.viewCount } });
    } catch (error) {
      next(error);
    }
  },

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const post = await postService.updatePost(userId, req.params.id as string, req.body);
      res.status(200).json({ success: true, data: { post } });
    } catch (error) {
      next(error);
    }
  },

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      await postService.deletePost(userId, req.params.id as string);
      res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async createReply(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const reply = await postService.createReply(userId, req.params.id as string, req.body);
      res.status(201).json({ success: true, data: { reply } });
    } catch (error) {
      next(error);
    }
  },

  async getReplies(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await postService.getReplies(req.params.id as string, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async markSolution(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id;
      const { replyId } = req.body;
      const post = await postService.markSolution(userId, req.params.id as string, replyId);
      res.status(200).json({ success: true, data: { post } });
    } catch (error) {
      next(error);
    }
  },

  async acceptAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id.toString();
      const post = await postService.acceptAnswer(userId, req.params.postId as string, req.params.replyId as string);
      res.status(200).json({ success: true, data: { post } });
    } catch (error) {
      next(error);
    }
  },

  async unacceptAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id.toString();
      const post = await postService.unacceptAnswer(userId, req.params.postId as string);
      res.status(200).json({ success: true, data: { post } });
    } catch (error) {
      next(error);
    }
  },

  async votePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id.toString();
      const vote = req.body.vote ?? (req.body.voteType === 'upvote' ? 1 : req.body.voteType === 'downvote' ? -1 : undefined);
      
      if (vote !== 1 && vote !== -1) {
        res.status(400);
        throw new Error('Vote must be 1 or -1');
      }

      const result = await postService.votePost(userId, req.params.id as string, vote);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async voteReply(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user._id.toString();
      const vote = req.body.vote ?? (req.body.voteType === 'upvote' ? 1 : req.body.voteType === 'downvote' ? -1 : undefined);
      
      if (vote !== 1 && vote !== -1) {
        res.status(400);
        throw new Error('Vote must be 1 or -1');
      }

      const result = await postService.voteReply(userId, req.params.id as string, vote);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
