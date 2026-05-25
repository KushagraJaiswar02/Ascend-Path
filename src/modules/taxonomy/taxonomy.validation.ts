import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const taxonomyListQuerySchema = z.object({
  query: z.object({
    includeInactive: z.enum(['true', 'false']).optional(),
    clusterId: objectId.optional(),
    q: z.string().trim().max(120).optional(),
  }),
});

export const resolveDomainSchema = z.object({
  query: z.object({
    q: z.string().trim().min(1).max(120),
  }),
});

export const upsertClusterSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).trim(),
    slug: z.string().min(2).max(140).trim().optional(),
    icon: z.string().max(80).trim().optional(),
    color: z.string().max(40).trim().optional(),
    description: z.string().max(800).trim().optional(),
    order: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
  }),
});

export const updateClusterSchema = z.object({
  body: upsertClusterSchema.shape.body.partial(),
});

export const upsertDomainSchema = z.object({
  body: z.object({
    clusterId: objectId,
    name: z.string().min(2).max(140).trim(),
    slug: z.string().min(2).max(160).trim().optional(),
    aliases: z.array(z.string().min(1).max(120).trim()).max(40).default([]),
    description: z.string().max(1200).trim().optional(),
    trendingScore: z.number().min(0).max(100).default(0),
    isActive: z.boolean().default(true),
  }),
});

export const updateDomainSchema = z.object({
  body: upsertDomainSchema.shape.body.partial(),
});

export const upsertGoalSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).trim(),
    slug: z.string().min(2).max(140).trim().optional(),
    description: z.string().max(800).trim().optional(),
    order: z.number().int().min(0).default(0),
    applicableStages: z.array(z.string().min(2).max(80).trim()).default([]),
    isActive: z.boolean().default(true),
  }),
});

export const updateGoalSchema = z.object({
  body: upsertGoalSchema.shape.body.partial(),
});

export type UpsertClusterInput = z.infer<typeof upsertClusterSchema>['body'];
export type UpsertDomainInput = z.infer<typeof upsertDomainSchema>['body'];
export type UpsertGoalInput = z.infer<typeof upsertGoalSchema>['body'];
