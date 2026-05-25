import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const recommendationQuerySchema = z.object({
  query: z.object({
    context: z.enum(['dashboard', 'onboarding', 'explore', 'mentors', 'roadmaps', 'sessions', 'forum']).default('dashboard'),
    limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1).max(30)).default(6),
    refresh: z.enum(['true', 'false']).optional(),
  }),
});

export const recommendationInteractionSchema = z.object({
  body: z.object({
    targetType: z.enum(['mentor', 'roadmap', 'session', 'forum', 'resource', 'career_path']),
    targetId: objectId,
    interactionType: z.enum(['viewed', 'clicked', 'ignored', 'enrolled', 'booked', 'completed', 'saved']),
    context: z.string().max(80).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export type RecommendationInteractionInput = z.infer<typeof recommendationInteractionSchema>['body'];
