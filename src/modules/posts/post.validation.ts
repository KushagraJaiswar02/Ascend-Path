import { z } from 'zod';
import { PostCategory } from './post.model';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters long').max(150, 'Title cannot exceed 150 characters').trim(),
    content: z.string().min(10, 'Content must be at least 10 characters long').trim(),
    category: z.nativeEnum(PostCategory).optional(),
    tags: z.array(z.string().trim()).max(5, 'Maximum of 5 tags allowed').optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters long').max(150, 'Title cannot exceed 150 characters').trim().optional(),
    content: z.string().min(10, 'Content must be at least 10 characters long').trim().optional(),
    category: z.nativeEnum(PostCategory).optional(),
    tags: z.array(z.string().trim()).max(5, 'Maximum of 5 tags allowed').optional(),
  }),
});

export const createReplySchema = z.object({
  body: z.object({
    content: z.string().min(2, 'Reply must be at least 2 characters long').trim(),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>['body'];
export type UpdatePostInput = z.infer<typeof updatePostSchema>['body'];
export type CreateReplyInput = z.infer<typeof createReplySchema>['body'];
