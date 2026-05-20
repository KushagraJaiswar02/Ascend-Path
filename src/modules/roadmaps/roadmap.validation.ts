import { z } from 'zod';

const roadmapStepSchema = z.object({
  title: z.string().min(3, 'Step title must be at least 3 characters').max(100, 'Step title cannot exceed 100 characters').trim(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').trim().optional(),
  resources: z.array(z.string().url('Resource must be a valid URL')),
  milestoneCheck: z.boolean().default(false),
});

export const createRoadmapSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters').trim(),
    description: z.string().max(2000, 'Description cannot exceed 2000 characters').trim().optional(),
    targetRole: z.string().max(100).trim().optional(),
    domain: z.string().max(100).trim().optional(),
    estimatedWeeks: z.number().int().min(1).max(260).optional(),
    steps: z.array(roadmapStepSchema).min(1, 'A roadmap must have at least one step'),
    isPublic: z.boolean().default(false),
  }),
});

export const updateRoadmapSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(150).trim().optional(),
    description: z.string().max(2000).trim().optional(),
    targetRole: z.string().max(100).trim().optional(),
    domain: z.string().max(100).trim().optional(),
    estimatedWeeks: z.number().int().min(1).max(260).optional(),
    steps: z.array(roadmapStepSchema).min(1).optional(),
    isPublic: z.boolean().optional(),
  }),
});

export const updateProgressSchema = z.object({
  body: z.object({
    stepIndex: z.number().int().min(0, 'Step index cannot be negative'),
    completed: z.boolean(),
  }),
});

export type CreateRoadmapInput = z.infer<typeof createRoadmapSchema>['body'];
export type UpdateRoadmapInput = z.infer<typeof updateRoadmapSchema>['body'];
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>['body'];
