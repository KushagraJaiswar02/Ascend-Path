import { z } from 'zod';

export const APPROVED_REVIEW_TAGS = [
  'Helpful',
  'Practical',
  'Beginner Friendly',
  'Deep Technical Knowledge',
  'Good Communication',
] as const;

export const createReviewSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    reviewText: z
      .string()
      .min(10, 'Review must be at least 10 characters long')
      .max(2000, 'Review cannot exceed 2000 characters')
      .trim(),
    tags: z
      .array(z.enum(APPROVED_REVIEW_TAGS))
      .max(3, 'You can select up to 3 descriptive tags')
      .optional()
      .default([]),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    reviewText: z.string().min(10).max(2000).trim().optional(),
    tags: z.array(z.enum(APPROVED_REVIEW_TAGS)).max(3).optional(),
  }),
});

export const reportReviewSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .min(5, 'Report reason must be at least 5 characters')
      .max(500, 'Report reason cannot exceed 500 characters')
      .trim(),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>['body'];
export type ReportReviewInput = z.infer<typeof reportReviewSchema>['body'];
