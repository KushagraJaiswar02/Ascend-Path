import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

// --- Roadmap Validations ---
export const createRoadmapSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters').trim(),
    description: z.string().max(2000, 'Description cannot exceed 2000 characters').trim().optional(),
    thumbnail: z.string().url('Thumbnail must be a valid URL').or(z.literal('')).optional(),
    domains: z.array(z.string()).default([]),
    careerDomains: z.array(objectId).default([]),
    careerGoals: z.array(objectId).default([]),
    targetStages: z.array(z.string().min(2).max(80).trim()).default([]),
    languages: z.array(z.string().min(2).max(40).trim()).default([]),
    budgetRange: z.string().max(80).trim().optional(),
    pathType: z.enum(['exam_prep', 'career_path', 'freelancing', 'study_abroad', 'vocational', 'skill_growth']).default('career_path'),
    nextRoadmaps: z.array(objectId).default([]),
    prerequisiteRoadmaps: z.array(objectId).default([]),
    recommendedSequence: z.array(objectId).default([]),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    estimatedWeeks: z.number().int().min(1).max(260).optional(),
    prerequisites: z.array(z.string()).default([]),
    learningOutcomes: z.array(z.string()).default([]),
    visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
    isPublished: z.boolean().default(false),
    // Compatibility fields
    targetRole: z.string().max(100).trim().optional(),
    domain: z.string().max(100).trim().optional(),
  }),
});

export const updateRoadmapSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(150).trim().optional(),
    description: z.string().max(2000).trim().optional(),
    thumbnail: z.string().url('Thumbnail must be a valid URL').or(z.literal('')).optional(),
    domains: z.array(z.string()).optional(),
    careerDomains: z.array(objectId).optional(),
    careerGoals: z.array(objectId).optional(),
    targetStages: z.array(z.string().min(2).max(80).trim()).optional(),
    languages: z.array(z.string().min(2).max(40).trim()).optional(),
    budgetRange: z.string().max(80).trim().optional(),
    pathType: z.enum(['exam_prep', 'career_path', 'freelancing', 'study_abroad', 'vocational', 'skill_growth']).optional(),
    nextRoadmaps: z.array(objectId).optional(),
    prerequisiteRoadmaps: z.array(objectId).optional(),
    recommendedSequence: z.array(objectId).optional(),
    tags: z.array(z.string()).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    estimatedWeeks: z.number().int().min(1).max(260).optional(),
    prerequisites: z.array(z.string()).optional(),
    learningOutcomes: z.array(z.string()).optional(),
    visibility: z.enum(['public', 'private', 'unlisted']).optional(),
    isPublished: z.boolean().optional(),
    targetRole: z.string().max(100).trim().optional(),
    domain: z.string().max(100).trim().optional(),
  }),
});

// --- Section Validations ---
export const createSectionSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Section title must be at least 3 characters').max(100).trim(),
    description: z.string().max(1000).trim().optional(),
    order: z.number().int().min(0).default(0),
  }),
});

export const updateSectionSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).trim().optional(),
    description: z.string().max(1000).trim().optional(),
    order: z.number().int().min(0).optional(),
  }),
});

// --- Step Validations ---
const resourceSchema = z.object({
  type: z.string().min(1, 'Resource type is required'),
  title: z.string().min(1, 'Resource title is required'),
  url: z.string().url('Resource must be a valid URL'),
});

export const createStepSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Step title must be at least 3 characters').max(100).trim(),
    description: z.string().max(2000, 'Description cannot exceed 2000 characters').trim().optional(),
    type: z.enum(['article', 'video', 'project', 'assignment', 'quiz', 'session', 'external resource']).default('article'),
    resources: z.array(resourceSchema).default([]),
    estimatedMinutes: z.number().int().min(0).default(0),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    order: z.number().int().min(0).default(0),
    isOptional: z.boolean().default(false),
    linkedSessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid session ObjectId').optional(),
    richNotes: z.string().max(5000).trim().optional(),
    videoUrl: z.string().trim().optional(),
    mentorTip: z.string().max(1000).trim().optional(),
  }),
});

export const updateStepSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).trim().optional(),
    description: z.string().max(2000).trim().optional(),
    type: z.enum(['article', 'video', 'project', 'assignment', 'quiz', 'session', 'external resource']).optional(),
    resources: z.array(resourceSchema).optional(),
    estimatedMinutes: z.number().int().min(0).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    order: z.number().int().min(0).optional(),
    isOptional: z.boolean().optional(),
    linkedSessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid session ObjectId').or(z.null()).optional(),
    richNotes: z.string().max(5000).trim().optional(),
    videoUrl: z.string().trim().optional(),
    mentorTip: z.string().max(1000).trim().optional(),
  }),
});

// --- Progress/Notes Validations ---
export const updateProgressSchema = z.object({
  body: z.object({
    notes: z.record(z.string(), z.string()).optional(),
    bookmarkedSteps: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid step ObjectId')).optional(),
  }),
});

export type CreateRoadmapInput = z.infer<typeof createRoadmapSchema>['body'];
export type UpdateRoadmapInput = z.infer<typeof updateRoadmapSchema>['body'];
export type CreateSectionInput = z.infer<typeof createSectionSchema>['body'];
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>['body'];
export type CreateStepInput = z.infer<typeof createStepSchema>['body'];
export type UpdateStepInput = z.infer<typeof updateStepSchema>['body'];
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>['body'];
