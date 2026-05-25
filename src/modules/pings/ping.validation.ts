import { z } from 'zod';

export const createPingSchema = z.object({
  body: z.object({
    toUserId: z.string().min(1, 'Target User ID is required'),
    question: z.string().min(10, 'Question must be at least 10 characters long').max(1000, 'Question cannot exceed 1000 characters').trim(),
    context: z.string().max(2000, 'Context cannot exceed 2000 characters').trim().optional(),
    startedFrom: z.enum(['roadmap', 'opportunity', 'mentor-profile', 'dashboard', 'domain-page']).default('mentor-profile'),
    linkedRoadmapId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    linkedOpportunityId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  }),
});

export const respondPingSchema = z.object({
  body: z.object({
    response: z.string().min(10, 'Response must be at least 10 characters long').max(3000, 'Response cannot exceed 3000 characters').trim(),
  }),
});

export const ratePingSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  }),
});

export type CreatePingInput = z.infer<typeof createPingSchema>['body'];
export type RespondPingInput = z.infer<typeof respondPingSchema>['body'];
export type RatePingInput = z.infer<typeof ratePingSchema>['body'];
