import { z } from 'zod';

export const createSessionSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(100).trim(),
    topic: z.string().min(2, 'Topic is required').max(50).trim(),
    description: z.string().max(1000).trim().optional(),
    scheduledAt: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format' }),
    durationMinutes: z.number().int().min(15).max(240),
    price: z.number().min(0).default(0),
    meetingLink: z.string().url('Must be a valid URL').optional(),
  }),
});

export const updateSessionSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(100).trim().optional(),
    topic: z.string().min(2).max(50).trim().optional(),
    description: z.string().max(1000).trim().optional(),
    scheduledAt: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format' }).optional(),
    durationMinutes: z.number().int().min(15).max(240).optional(),
    price: z.number().min(0).optional(),
    meetingLink: z.string().url('Must be a valid URL').optional(),
  }),
});

export const rateSessionSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    review: z.string().max(2000).trim().optional(),
  }),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>['body'];
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>['body'];
export type RateSessionInput = z.infer<typeof rateSessionSchema>['body'];
