import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const upsertPathwayConnectionSchema = z.object({
  body: z.object({
    sourceDomain: objectId,
    targetDomain: objectId,
    relationshipType: z.enum(['adjacent_career', 'specialization', 'beginner_to_advanced', 'interdisciplinary', 'skill_transition', 'outcome_path']),
    overlapStrength: z.number().min(0).max(100).default(50),
    requiredSkills: z.array(z.string().min(1).max(120)).default([]),
    opportunityOutcomes: z.array(z.string().min(1).max(160)).default([]),
    decisionSignals: z.array(z.string().min(1).max(220)).default([]),
    estimatedTimelineWeeks: z.number().int().min(1).max(520).optional(),
    suggestedRoadmaps: z.array(objectId).default([]),
    isActive: z.boolean().default(true),
  }),
});

export const updatePathwayConnectionSchema = z.object({
  body: upsertPathwayConnectionSchema.shape.body.partial(),
});

export const domainHubSchema = z.object({
  params: z.object({
    slug: z.string().min(1).max(160),
  }),
});
