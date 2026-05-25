import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const createJournalEntrySchema = z.object({
  body: z.object({
    entryType: z.enum(['reflection', 'win', 'setback', 'note', 'realization', 'mentorship_takeaway']).default('reflection'),
    title: z.string().min(2).max(160).trim(),
    body: z.string().min(2).max(5000).trim(),
    mood: z.enum(['confident', 'curious', 'stuck', 'uncertain', 'motivated', 'tired']).optional(),
    tags: z.array(z.string().min(1).max(60).trim()).default([]),
    relatedDomainIds: z.array(objectId).default([]),
    isPrivate: z.boolean().default(true),
  }),
});

export const submitGrowthCheckInSchema = z.object({
  body: z.object({
    confidenceLevel: z.number().int().min(1).max(5),
    hardestThing: z.string().max(1200).trim().optional(),
    goalsChanged: z.boolean().default(false),
    newGoalText: z.string().max(1000).trim().optional(),
    pacingFeeling: z.enum(['too_slow', 'right', 'too_fast', 'overwhelmed']).optional(),
    supportNeeded: z.array(z.string().min(1).max(80).trim()).default([]),
  }),
});

export const companionQuerySchema = z.object({
  query: z.object({
    limit: z.preprocess((value) => (value ? Number(value) : undefined), z.number().int().min(1).max(100)).default(30),
  }),
});

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>['body'];
export type SubmitGrowthCheckInInput = z.infer<typeof submitGrowthCheckInSchema>['body'];
