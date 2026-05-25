import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const createOpportunitySchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120).trim(),
    opportunityType: z.enum([
      'internship',
      'job',
      'freelance',
      'scholarship',
      'competition',
      'exam',
      'university',
      'bootcamp',
      'fellowship',
    ]),
    organizationName: z.string().min(2).max(100).trim(),
    organizationLogo: z.string().url().optional().or(z.literal('')),
    domains: z.array(z.string()).default([]),
    careerDomains: z.array(objectId).default([]),
    careerGoals: z.array(objectId).default([]),
    requiredSkills: z.array(z.string()).default([]),
    preferredSkills: z.array(z.string()).default([]),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    eligibilityCriteria: z.string().max(2000).optional(),
    location: z.string().max(100).optional(),
    remoteStatus: z.enum(['remote', 'hybrid', 'onsite']).default('remote'),
    stipend: z.string().max(80).optional(),
    salaryRange: z.string().max(80).optional(),
    applicationDeadline: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).transform((val) => new Date(val)),
    applicationLink: z.string().url().trim(),
    readinessSignals: z.array(z.string()).default([]),
    recommendedRoadmaps: z.array(objectId).default([]),
  }),
});

export const updateApplicationSchema = z.object({
  body: z.object({
    status: z.enum(['applied', 'shortlisted', 'interviewing', 'rejected', 'accepted', 'archived']).optional(),
    notes: z.string().max(4000).optional(),
    mentorGuidance: z.string().max(4000).optional(),
    interviewReflections: z.string().max(4000).optional(),
    connectedProjects: z.array(objectId).optional(),
    connectedAchievements: z.array(objectId).optional(),
  }),
});

export const addReminderSchema = z.object({
  body: z.object({
    date: z.string().datetime().transform((val) => new Date(val)),
    note: z.string().min(2).max(500).trim(),
  }),
});

export const verifyOpportunitySchema = z.object({
  body: z.object({
    verificationStatus: z.enum(['approved', 'rejected']),
    isFeatured: z.boolean().optional(),
  }),
});

export const opportunityQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    opportunityType: z.string().optional(),
    difficulty: z.string().optional(),
    remoteStatus: z.string().optional(),
    domainId: z.string().optional(),
    goalId: z.string().optional(),
    featured: z.preprocess((val) => val === 'true', z.boolean()).optional(),
    sortByReady: z.preprocess((val) => val === 'true', z.boolean()).optional(),
    page: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1)).default(1),
    limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1).max(100)).default(20),
  }),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>['body'];
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>['body'];
export type AddReminderInput = z.infer<typeof addReminderSchema>['body'];
export type VerifyOpportunityInput = z.infer<typeof verifyOpportunitySchema>['body'];
