import { z } from 'zod';

export const submitSessionReflectionSchema = z.object({
  body: z.object({
    learnings: z.string().min(10, 'Share at least one concrete learning').max(3000).trim(),
    confidenceLevel: z.number().int().min(1).max(5),
    nextChallenge: z.string().min(5, 'Add the remaining challenge').max(1500).trim(),
  }),
});

const recommendedRoadmapStepSchema = z.object({
  roadmapId: z.string().optional(),
  stepId: z.string().optional(),
  title: z.string().min(2).max(160).trim(),
  reason: z.string().max(500).trim().optional(),
});

const recommendedResourceSchema = z.object({
  title: z.string().min(2).max(160).trim(),
  url: z.string().url(),
  type: z.enum(['article', 'video', 'course', 'tool', 'docs', 'other']).optional(),
});

const recommendedProjectSchema = z.object({
  title: z.string().min(2).max(160).trim(),
  description: z.string().max(1000).trim().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

export const submitMentorFollowupSchema = z.object({
  body: z.object({
    recommendedRoadmapSteps: z.array(recommendedRoadmapStepSchema).max(8).optional(),
    recommendedResources: z.array(recommendedResourceSchema).max(8).optional(),
    recommendedProjects: z.array(recommendedProjectSchema).max(5).optional(),
    mentorNotes: z.string().max(3000).trim().optional(),
    nextSessionSuggestion: z.string().max(1000).trim().optional(),
  }),
});

export type SubmitSessionReflectionInput = z.infer<typeof submitSessionReflectionSchema>['body'];
export type SubmitMentorFollowupInput = z.infer<typeof submitMentorFollowupSchema>['body'];
